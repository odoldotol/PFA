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
import { catchError, firstValueFrom } from 'rxjs';
// import isEqual from 'lodash.isequal';

@Injectable()
export class UpdaterService {

    private readonly logger = new Logger(UpdaterService.name);
    private readonly PRODUCT_URL = this.configService.get('PRODUCT_URL');

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
            } else { // 최신 아니면 // XUTC 는 항상 현재가로 초기화 되는점 알기 (isNotMarketOpen)
                const isNotMarketOpen = this.isNotMarketOpen(marketSession, ISO_Code)
                isNotMarketOpen ?
                /* logger */this.logger.verbose(`${ISO_Code} : Not UpToDate`) :
                /* logger */this.logger.verbose(`${ISO_Code} : Not UpToDate & Market Is Open`)
                // 가격 업데이트하기
                const updateResult = await this.updatePriceByStatusPriceDocAndPreviousclose(spDoc, marketSession["previous_close"], isNotMarketOpen)
                // log_priceUpdate Doc 생성
                this.createLogPriceUpdateDoc("initiator", updateResult, ISO_Code)
                // 다음마감시간에 업데이트스케줄 생성하기
                this.schedulerForPrice(ISO_Code, marketSession["next_close"])
                // Product 애 regularUpdater 요청하기
                this.requestRegularUpdaterToProduct(ISO_Code, marketSession["previous_close"], updateResult)
            };
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
            const updateResult = await this.updatePriceByStatusPriceDocAndPreviousclose(statusPriceDoc, marketSession["previous_close"], true)
            this.createLogPriceUpdateDoc("scheduler", updateResult, ISO_Code)
            this.schedulerForPrice(ISO_Code, marketSession["next_close"])
            this.requestRegularUpdaterToProduct(ISO_Code, marketSession["previous_close"], updateResult)
        } catch (err) {
            throw err
        };
    }

    /**
     * ### Status_priceDoc 와 previous_close 로 가격 업데이트하기
     * - 업데이트 시작 종료 logger
     * - 가격 업데이트
     * - status 업뎃
     */
    async updatePriceByStatusPriceDocAndPreviousclose(statusPriceDoc: Status_priceDocument, previous_close: string, isNotMarketOpen: boolean) {
        try {
            /* logger */this.logger.warn(`${statusPriceDoc.ISO_Code} : Updater Run!!!`)
            const startTime = new Date().toISOString()
            // 가격 업데이트
            const updatePriceResult = await this.updatePriceByFilters([{exchangeTimezoneName: statusPriceDoc.yf_exchangeTimezoneName}], true, isNotMarketOpen)

            // status 업뎃
            statusPriceDoc.lastMarketDate = new Date(previous_close).toISOString()
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
                isStandard: true, //
                key,
                success: updateResult.updatePriceResult["success"],
                failure: updateResult.updatePriceResult["failure"],
                error: updateResult["error"] || updateResult.updatePriceResult["error"],
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
     * ### Product 애 regularUpdater 요청하기
     */
    async requestRegularUpdaterToProduct(ISO_Code: string, previous_close: string, updateResult) {
        const marketDate = previous_close.slice(0, 10);
        let priceArrs = updateResult.updatePriceResult["success"];
        priceArrs = priceArrs.map((priceArr) => {
            const regularMarketLastClose = priceArr[1].regularMarketLastClose;
            return [priceArr[0], regularMarketLastClose]
        })
        const result = (await firstValueFrom(
            this.httpService.post(`${this.PRODUCT_URL}market/updater/${ISO_Code}`, {marketDate, priceArrs})
            .pipe(catchError(error => {
                throw error;
            }))
        )).status;
        /* logger */this.logger.verbose(`${ISO_Code} : Product RegularUpdater Response: ${result}`,);
        // return result;
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
            const previousClose = new Date(marketSession['previous_close']).toISOString()
            return spDoc.lastMarketDate === previousClose ? true : false
        } catch (err) {
            throw err
        };
    }

    /**
     * ### 세션 정보 로 장중이 아닌지 알아내기
     * - 장중이 아니면 true, 장중이면 false
     * - XUTC 는 항상 true 반환중
     */
    isNotMarketOpen(marketSession: object, ISO_Code: string) {
        try {
            // if (ISO_Code === "XUTC") { // 뭐가 옳은지, 뭐가 더 정확할지?
            //     return false;
            // };
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
     * - 가격 업뎃 구조 리팩터 필요
     */
    async updatePriceByTickerArr(tickerArr: string[], lastClose?: "regularMarketPreviousClose" | "regularMarketPrice") {
        try {
            // 가격 배열 가져오기
            const priceArr = await this.yahoofinanceService.getSomethingByTickerArr(tickerArr, "Price");

            // 디비 업데이트
            const result = {success: [], failure: []};
            const updatePromiseArr = tickerArr.map((ticker, idx) => { // map 의 콜백에서 return 없어도 Promise<void> 가 리턴되도록? 차이는?
                if (priceArr[idx]["error"]) {
                    priceArr[idx]['ticker'] = ticker;
                    result.failure.push(priceArr[idx]);
                } else {
                    const regularMarketPreviousClose = priceArr[idx]["regularMarketPreviousClose"];
                    const regularMarketPrice = priceArr[idx]["regularMarketPrice"];
                    const regularMarketLastClose = priceArr[idx][lastClose]
                    priceArr[idx]["regularMarketLastClose"] = regularMarketLastClose
                    return this.yf_infoModel.updateOne({ symbol: ticker }, { regularMarketPreviousClose, regularMarketPrice, regularMarketLastClose }).exec()
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
                                result.success.push([ticker, priceArr[idx]]);
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
     * - 가격 업뎃 구조 리팩터 필요
     */
    async updatePriceByFilters(filterArr: object[], isStandard: boolean, isNotMarketOpen: boolean) {
        try {
            // db 에서 각 filter 들로 find 한 documents 들의 symbol 배열들을 만들어서 각각 updatePriceByTickerArr(symbol배열) 을 실행시켜!
            return Promise.all(filterArr.map(async (filter) => {
                return await this.yf_infoModel.find(filter, 'symbol').exec()
                    .then(async (res) => {
                        const symbolArr = res.map(ele=>ele.symbol)
                        if (isStandard && isNotMarketOpen) {
                            return await this.updatePriceByTickerArr(symbolArr, "regularMarketPrice");
                        } else if (isStandard && !isNotMarketOpen) {
                            return await this.updatePriceByTickerArr(symbolArr, "regularMarketPreviousClose");
                        } else {
                            return await this.updatePriceByTickerArr(symbolArr);
                        }
                    })
                    .catch((error) => {
                        // console.log(error);
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
