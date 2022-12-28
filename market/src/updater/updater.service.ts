import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Yf_info, Yf_infoDocument } from 'src/mongodb/schema/yf_info.schema';
import { YahoofinanceService } from 'src/yahoofinance/yahoofinance.service';
import { Status_price, Status_priceDocument } from 'src/mongodb/schema/status_price.schema';
import { Log_priceUpdate, Log_priceUpdateDocument } from 'src/mongodb/schema/log_priceUpdate.schema';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob, CronTime } from 'cron';
import console from 'console';
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
     * - price status 가 최신인지 알아내기
     *      - 최신이면 "다음마감시간에 업데이트스케줄 생성하기"
     *      - 아니면 "장중인지 알아내기"
     * - 장중인지 알아내기
     *      - 장중이아니면 "가격 업데이트하기", "다음마감시간에 업데이트스케줄 생성하기"
     *      - 장중이면 "다음마감시간에 업데이트스케줄 생성하기"
     */
    async initiator() {
        /* logger */this.logger.warn("Initiator Run!!!");
        const spDocArr = await this.status_priceModel.find().exec()
        await Promise.all(spDocArr.map(async (spDoc) => {
            if (spDoc.ISO_Code === "XUTC") {
                await this.initiateForUTC(spDoc)
            } else {
                await this.generalInitiate(spDoc)
            };
        }))
        .then(() => {
            /* logger */this.logger.warn("Initiator End!!!");
        })
        .catch((err) => {
            /* logger */this.logger.error(err)
        })
    }

    /**
     * ###
     */
    async generalInitiate(spDoc) {
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
                if (updateResult["error"]) {}
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
    }

    /**
     * ### UTC 에 대한 초기실행
     * 당장 UTC 가격 업데이트 하고, 다음 00:00:00 에 업데이트스케줄 생성하기
     */
    async initiateForUTC(spDoc) {
        const ISO_Code = spDoc.ISO_Code

        const updateResult = await this.updatePriceByStatusPriceDocAndPreviousopen(spDoc, new Date().toISOString())
        this.createLogPriceUpdateDoc("initiator", updateResult, ISO_Code)

        const now = new Date()
        const year = now.getUTCFullYear()
        const month = now.getUTCMonth()+1
        const date = now.getUTCDate()+1
        const nextClose = new Date(`${year}-${month}-${date}`).toISOString()
        this.schedulerForPrice(ISO_Code, nextClose)
    }

    /**
     * ### ISO code 와 next_close 로 다음마감시간에 업데이트스케줄 생성|시간수정 하기
     * - 15 분의 안전마진
     */
    async schedulerForPrice(ISO_Code: string, next_close: string) {
        const nextCloseDate = new Date(next_close)
        nextCloseDate.setMinutes(nextCloseDate.getMinutes() + 15) // 15분 안전마진

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
        /* logger */this.logger.warn(`${ISO_Code} : scheduled ${nextCloseDate.toLocaleString()}`,);
    }

    /**
     * ### 가격 업데이터
     * - ISO_Code 로 가격 업데이트
     * - 다음마감시간에 업데이트스케줄 생성
     */
    async recusiveUpdaterForPrice(ISO_Code: string) {
        const statusPriceDoc = await this.getStatusPriceDocByISOcode(ISO_Code)
        const marketSession = await this.getSessionSomethingByISOcode(ISO_Code)
        const updateResult = await this.updatePriceByStatusPriceDocAndPreviousopen(statusPriceDoc, marketSession["previous_open"])
        this.createLogPriceUpdateDoc("scheduler", updateResult, ISO_Code)
        await this.schedulerForPrice(ISO_Code, marketSession["next_close"])
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
            const updatePriceResult = this.updatePriceByFilters([{exchangeTimezoneName: statusPriceDoc.yf_exchangeTimezoneName}])

            // status 업뎃
            statusPriceDoc.lastMarketDate = new Date(previous_open).toISOString()
            const updatetSatusPriceResult = statusPriceDoc.save()
                .then(doc => doc)
                .catch((error) => {return {error}})

            await Promise.all([updatePriceResult, updatetSatusPriceResult])
            
            const endTime = new Date().toISOString()
            /* logger */this.logger.warn(`${statusPriceDoc.ISO_Code} : Updater End!!!`)

            return {
                updatePriceResult,
                updatetSatusPriceResult,
                startTime,
                endTime
            }
        } catch (err) {
            throw new InternalServerErrorException(err);
        }
    }

    /**
     * ### log_priceUpdate Doc 생성 By launcher, updateResult, key
     */
    async createLogPriceUpdateDoc(launcher: string, updateResult, key: string | Array<string | Object>) {
        const {startTime, endTime} = updateResult
        const newLog = new this.log_priceUpdateModel({
            launcher,
            isRegular: true,
            key,
            successTickerArr: updateResult.updatePriceResult["success"],
            failTickerArr: updateResult.updatePriceResult["failure"],
            error: updateResult.updatePriceResult["error"],
            startTime,
            endTime,
            duration: new Date(endTime).getTime() - new Date(startTime).getTime()
        })
        const logSaveResult = await newLog.save()
    }

    /**
     * ISO code 로 Status_price 에서 Doc 가져오기
     */
    getStatusPriceDocByISOcode(ISO_Code: string) {
        try {
            return this.status_priceModel.findOne({ ISO_Code }).exec();
        } catch (err) {
            throw new InternalServerErrorException(err);
        }
    }

    /**
     * ### ISO code 로 session 의 something 알아내기
     */
    async getSessionSomethingByISOcode(ISO_Code: string, something?: "previous_open" | "previous_close" | "next_open" | "next_close") {
        try {
            const marketSession = await this.yahoofinanceService.getMarketSessionByISOcode(ISO_Code)
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
            throw new InternalServerErrorException(err);
        }
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
            throw new InternalServerErrorException(err);
        }
    }

    /**
     * 티커배열로 가격 업데이트하기
     */
    async updatePriceByTickerArr(tickerArr: string[]) {
        // 가격 배열 가져오기
        const priceArr = await this.yahoofinanceService.getSomethingByTickerArr(tickerArr, "Price");

        // 디비 업데이트
        // 수정할것 = (이왕이면, regularMarketPreviousClose = regularMarketPrice 후에 업댓하자)
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
    }

    /**
     * ### 필터배열로 ticker 배열들 뽑아서 각각 updatePriceByTickerArr 실행
     */
    async updatePriceByFilters(filterArr: object[]) {
        // db 에서 각 filter 들로 find 한 documents 들의 symbol 배열들을 만들어서 각각 updatePriceByTickerArr(symbol배열) 을 실행시켜!
        return Promise.all(filterArr.map(async (filter) => {
            return await this.yf_infoModel.find(filter, 'symbol').exec()
                .then(async (res) => {
                    const symbolArr = res.map(ele=>ele.symbol) // await this.updatePriceByTickerArr(res.map(ele=>ele.symbol)); <- 요로케 하면 안되요! // 내가 그냥 함수를 넣어버린게 되는건가? 그렇다면, 즉시실행함수형태로 하면 될거같은데?
                    return await this.updatePriceByTickerArr(symbolArr);
                })
                .catch((error) => {
                    // console.log(err);
                    return {error, filter};
                })
        }))
    }

    // async updatePriceAll(each: number) {
    //     this.getPriceByTickerList([]);
    //     return each;
    // }
}
