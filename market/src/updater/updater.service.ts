import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Yf_info, Yf_infoDocument } from '../mongodb/schema/yf_info.schema';
import { YahoofinanceService } from '../yahoofinance/yahoofinance.service';
import { Status_price, Status_priceDocument } from '../mongodb/schema/status_price.schema';
import { Log_priceUpdate, Log_priceUpdateDocument } from '../mongodb/schema/log_priceUpdate.schema';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob, CronTime } from 'cron';
// import isEqual from 'lodash.isequal';

@Injectable()
export class UpdaterService {

    private readonly logger = new Logger(UpdaterService.name);

    constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
        private readonly schedulerRegistry: SchedulerRegistry,
        @InjectModel(Yf_info.name) private yf_infoModel: Model<Yf_infoDocument>,
        @InjectModel(Status_price.name) private status_priceModel: Model<Status_priceDocument>,
        @InjectModel(Log_priceUpdate.name) private log_priceUpdateModel: Model<Log_priceUpdateDocument>,
        private readonly yahoofinanceService: YahoofinanceService,
    ) {
        this.initiator();
    }

    /**
     * ### 업데이터 초기실행
     * Status_price 에서 모든 Doc 들을 가져와서 각각의 Doc 을 병열처리
     * - Initiator 시작 종료 logger
     */
    async initiator() {
        try {
            /* logger */this.logger.warn("Initiator Run!!!");
            const spDocArr = await this.getAllStatusPriceDoc();
            await Promise.all(spDocArr.map(async (spDoc) => {
                await this.generalInitiate(spDoc)
            }))
            .then(() => {
                /* logger */this.logger.warn("Initiator End!!!");
            })
            .catch((err) => {
                /* logger */this.logger.error(err)
            })
        } catch (err) {
            throw err
        };
    }

    /**
     * ### 표준 초기실행
     * - price status 가 최신인지 알아내기
     *      - 최신이면 "다음마감시간에 업데이트스케줄 생성하기"
     *      - 아니면 "장중인지 알아내기"
     * - 장중인지 알아내기
     *      - 장중이아니면 "가격 업데이트하기", "다음마감시간에 업데이트스케줄 생성하기"
     *      - 장중이면 "다음마감시간에 업데이트스케줄 생성하기"
     */
    async generalInitiate(spDoc) {
        try {
            const ISO_Code = spDoc.ISO_Code
            const marketSession = await this.getSessionSomethingByISOcode(ISO_Code)
            // price status 가 최신인지 알아내기
            const isUpToDate = await this.isPriceStatusUpToDate(ISO_Code, marketSession)
            if (isUpToDate) { // 최신이면
                // 다음마감시간에 업데이트스케줄 생성하기
                /* logger */this.logger.verbose(`${ISO_Code} : UpToDate`)
                this.schedulerForPrice(ISO_Code, marketSession["next_close"])
            } else { // 최신 아니면
                const isNotMarketOpen = await this.isNotMarketOpen(marketSession)
                if (isNotMarketOpen) { // 장중이아니면
                    /* logger */this.logger.verbose(`${ISO_Code} : Not UpToDate`)
                    // 가격 업데이트하기
                    const updateResult = await this.updatePriceByStatusPriceDocAndPreviousopen(spDoc, marketSession["previous_open"])
                    // log_priceUpdate Doc 생성
                    this.createLogPriceUpdateDoc("initiator", updateResult, ISO_Code)
                    // 다음마감시간에 업데이트스케줄 생성하기
                    this.schedulerForPrice(ISO_Code, marketSession["next_close"])
                } else { // 장중이면
                    /* logger */this.logger.verbose(`${ISO_Code} : Market Is Open`)
                    // 다음마감시간에 업데이트스케줄 생성하기
                    this.schedulerForPrice(ISO_Code, marketSession["next_close"])
                }
            }
        } catch (err) {
            throw err
        };
    }

    /**
     * ### ISO code 와 next_close 로 다음마감시간에 업데이트스케줄 생성|시간수정 하기
     * - 15 분의 안전마진 (UTC 는 1 초)
     */
    schedulerForPrice(ISO_Code: string, next_close: string) {
        try {
            const nextCloseDate = new Date(next_close)
            if (ISO_Code === "XUTC") {
                nextCloseDate.setSeconds(nextCloseDate.getSeconds() + 1) // 1초 안전마진
            } else {
                nextCloseDate.setMinutes(nextCloseDate.getMinutes() + 15) // 15분 안전마진
            }

            try {
                const schedule = this.schedulerRegistry.getCronJob(ISO_Code)
                const nextCloseCronTime = new CronTime(nextCloseDate)
                schedule.setTime(nextCloseCronTime)
            } catch (error) {
                if (error.message.slice(0, 48) === `No Cron Job was found with the given name (${ISO_Code})`) {
                    const newUpdateSchedule = new CronJob(nextCloseDate, this.recusiveUpdaterForPrice.bind(this, ISO_Code));
                    this.schedulerRegistry.addCronJob(ISO_Code, newUpdateSchedule);
                    newUpdateSchedule.start();
                } else {
                    /* logger */this.logger.error(error)
                }
            }
            /* logger */this.logger.log(`${ISO_Code} : scheduled ${nextCloseDate.toLocaleString()}`,);
        } catch (err) {
            throw err
        };
    }

    /**
     * ### 가격 업데이터
     * 업뎃하고 다음 스케줄을 생성하는것 까지
     * - ISO_Code 로 가격 업데이트
     * - 다음마감시간에 업데이트스케줄 생성
     */
    async recusiveUpdaterForPrice(ISO_Code: string) {
        try {
            const statusPriceDoc = await this.getStatusPriceDocByISOcode(ISO_Code)
            const marketSession = await this.getSessionSomethingByISOcode(ISO_Code)
            const updateResult = await this.updatePriceByStatusPriceDocAndPreviousopen(statusPriceDoc, marketSession["previous_open"])
            this.createLogPriceUpdateDoc("scheduler", updateResult, ISO_Code)
            this.schedulerForPrice(ISO_Code, marketSession["next_close"])
        } catch (err) {
            throw err
        };
    }

    /**
     * ### Status_priceDoc 와 previous_open 로 가격 업데이트하기
     * - 업데이트 시작 종료 logger
     * - 가격 업데이트
     * - status 업뎃
     */
    async updatePriceByStatusPriceDocAndPreviousopen(statusPriceDoc: Status_priceDocument, previous_open: string) {
        try {
            /* logger */this.logger.warn(`${statusPriceDoc.ISO_Code} : Updater Run!!!`)
            const startTime = new Date().toISOString()
            // 가격 업데이트
            const updatePriceResult = await this.updatePriceByFilters([{exchangeTimezoneName: statusPriceDoc.yf_exchangeTimezoneName}])

            // status 업뎃
            statusPriceDoc.lastMarketDate = new Date(previous_open).toISOString()
            const updatetSatusPriceResult = await statusPriceDoc.save()
                .then(doc => doc)
                .catch((error) => {return {error}})

            await Promise.all([updatePriceResult, updatetSatusPriceResult])
            
            const endTime = new Date().toISOString()
            /* logger */this.logger.warn(`${statusPriceDoc.ISO_Code} : Updater End!!!`)

            return {
                updatePriceResult: updatePriceResult[0],
                updatetSatusPriceResult,
                startTime,
                endTime
            }
        } catch (err) {
            throw err
        }
    }

    /**
     * ### log_priceUpdate Doc 생성 By launcher, updateResult, key
     */
    async createLogPriceUpdateDoc(launcher: string, updateResult, key: string | Array<string | Object>) {
        try {
            const {startTime, endTime} = updateResult
            const newLog = new this.log_priceUpdateModel({
                launcher,
                isRegular: true,
                key,
                successTickerArr: updateResult.updatePriceResult["success"],
                failTickerArr: updateResult.updatePriceResult["failure"],
                error: updateResult["error"] | updateResult.updatePriceResult["error"],
                startTime,
                endTime,
                duration: new Date(endTime).getTime() - new Date(startTime).getTime()
            })
            newLog.save()
                .then(() => {
                    if (launcher === "scheduler" || launcher === "initiator") {
                        /* logger */this.logger.verbose(`${key} : Log_priceUpdate Doc Created`)
                    } else {
                        /* logger */this.logger.verbose(`Log_priceUpdate Doc Created : ${launcher}`)
                    }
                })
                .catch((error) => {
                    /* logger */this.logger.error(error)
                })
        } catch (err) {
            throw err
        };
    }

    /**
     * ISO code 로 Status_price 에서 Doc 가져오기
     */
    getStatusPriceDocByISOcode(ISO_Code: string) {
        try {
            return this.status_priceModel.findOne({ ISO_Code }).exec();
        } catch (err) {
            throw err
        };
    }

    /**
     * ###
     */
    getAllStatusPriceDoc() {
        try {
            return this.status_priceModel.find().exec();
        } catch (err) {
            throw err
        };
    }

    /**
     * ### ISO code 로 session 의 something 알아내기
     * - UTC 케이스 특이사항
     */
    async getSessionSomethingByISOcode(ISO_Code: string, something?: "previous_open" | "previous_close" | "next_open" | "next_close") {
        try {
            let marketSession
            if (ISO_Code === "XUTC") {
                const previous = new Date(
                    new Date().toISOString().slice(0, 10)/*+"T00:00:00.000Z"*/
                ).toISOString()
                const nextDate = new Date(previous)
                nextDate.setUTCDate(nextDate.getUTCDate() + 1)
                const next = nextDate.toISOString()
                marketSession = {
                    previous_open: previous,
                    previous_close: previous,
                    next_open: next,
                    next_close: next
                }
            } else {
                marketSession = await this.yahoofinanceService.getMarketSessionByISOcode(ISO_Code)
            }
            if (marketSession.error) {
                console.log("ERROR: ", marketSession.error)
                throw marketSession.error
            }
            return something ? marketSession[something]
                : marketSession;
        } catch (err) {
            throw err;
        }
    }

    /**
     * ### 세션 정보 로 price status 가 최신인지 알아내기
     */
    async isPriceStatusUpToDate(ISO_Code: string, marketSession: object) {
        try {
            const spDoc = await this.getStatusPriceDocByISOcode(ISO_Code)
            const previousOpen = new Date(marketSession['previous_open']).toISOString()
            return spDoc.lastMarketDate === previousOpen ? true : false
        } catch (err) {
            throw err
        };
    }

    /**
     * ### 세션 정보 로 장중이 아닌지 알아내기
     * - 장중이 아니면 true, 장중이면 false
     */
    async isNotMarketOpen(marketSession: object) {
        try {
            const previous_open = new Date(marketSession["previous_open"])
            const previous_close = new Date(marketSession["previous_close"])
            const next_open = new Date(marketSession["next_open"])
            const next_close = new Date(marketSession["next_close"])
            if (previous_open > previous_close && next_open > next_close) { // 장중
                return false;
            }
            return true;
        } catch (err) {
            throw err;
        };
    }

    /**
     * 티커배열로 가격 업데이트하기
     */
    async updatePriceByTickerArr(tickerArr: string[]) {
        try {
            // 가격 배열 가져오기
            const priceArr = await this.yahoofinanceService.getSomethingByTickerArr(tickerArr, "Price");

            // 디비 업데이트
            let result = {success: [], failure: []};
            let updatePromiseArr = tickerArr.map((ticker, idx) => { // map 의 콜백에서 return 없어도 Promise<void> 가 리턴되도록? 차이는?
                if (priceArr[idx]["error"]) {
                    priceArr[idx]['ticker'] = ticker;
                    result.failure.push(priceArr[idx]);
                }
                else {
                    return this.yf_infoModel.updateOne({ symbol: ticker }, { regularMarketPrice: priceArr[idx] }).exec()
                        .then((res)=>{
                            // const successRes = {
                            //     acknowledged: true,
                            //     modifiedCount: 1,
                            //     upsertedId: null,
                            //     upsertedCount: 0,
                            //     matchedCount: 1
                            // }
                            if (
                                res.acknowledged &&
                                res.modifiedCount === 1 &&
                                res.upsertedId === null &&
                                res.upsertedCount === 0 &&
                                res.matchedCount === 1
                                ) /* 예외 케이스가 발견됨에 따라 수정해야항 수도 있음 */ {
                                result.success.push(ticker);
                            } else {
                                result.failure.push({error: "updateOne error", ticker, res});
                            }
                        })
                        .catch(error => {
                            result.failure.push({error, ticker});
                        })
                }
            })
            await Promise.all(updatePromiseArr);
            return result;
        } catch (err) {
            throw err;
        };
    }

    /**
     * ### 필터배열로 ticker 배열들 뽑아서 각각 updatePriceByTickerArr 실행
     */
    async updatePriceByFilters(filterArr: object[]) {
        try {
            // db 에서 각 filter 들로 find 한 documents 들의 symbol 배열들을 만들어서 각각 updatePriceByTickerArr(symbol배열) 을 실행시켜!
            return Promise.all(filterArr.map(async (filter) => {
                return await this.yf_infoModel.find(filter, 'symbol').exec()
                    .then(async (res) => {
                        const symbolArr = res.map(ele=>ele.symbol)
                        return await this.updatePriceByTickerArr(symbolArr);
                    })
                    .catch((error) => {
                        // console.log(err);
                        return {error, filter};
                    })
            }));
        } catch (err) {
            throw err;
        };
    }

    // async updatePriceAll(each: number) {
    //     this.getPriceByTickerList([]);
    //     return each;
    // }
}
