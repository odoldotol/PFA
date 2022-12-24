import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Yf_info, Yf_infoDocument } from 'src/mongodb/schema/yf_info.schema';
import { YahoofinanceService } from 'src/yahoofinance/yahoofinance.service';
import { Status_price, Status_priceDocument } from 'src/mongodb/schema/status_price.schema';
// import isEqual from 'lodash.isequal';

@Injectable()
export class UpdaterService {

    constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
        @InjectModel(Yf_info.name) private yf_infoModel: Model<Yf_infoDocument>,
        @InjectModel(Status_price.name) private status_priceModel: Model<Status_priceDocument>,
        private readonly yahoofinanceService: YahoofinanceService,
    ) {}
    
    /**
     * ISO code 로 Status_price 에서 Doc 가져오기
     */
    getStatusPriceDocByISOcode(ISO_Code: string) {
        return this.status_priceModel.findOne({ISO_Code}).exec()
        .then((doc)=>{
            return doc;
        })
        .catch((err)=>{
            throw new InternalServerErrorException(err);
        })
    }

    /**
     * ### ISO code 로 session 의 something 알아내기
     */
    async getSessionSomethingByISOcode(ISO_Code: string, something?: "previous_open" | "previous_close" | "next_open" | "next_close") {
        try {
            return something ? await this.yahoofinanceService.getMarketSessionByISOcode(ISO_Code)[something]
                : await this.yahoofinanceService.getMarketSessionByISOcode(ISO_Code);
        } catch (err) {
            throw new InternalServerErrorException(err);
        }
    }

    /**
     * ### ISO code 로 price status 가 최신인지 알아내기
     */
    async isPriceStatusUpToDate(ISO_Code: string) {
        try {
            const spDoc = await this.getStatusPriceDocByISOcode(ISO_Code)
            const lastMarketDate = await this.getSessionSomethingByISOcode(ISO_Code, "previous_open")
            return spDoc.lastMarketDate === lastMarketDate ? true : false
        } catch (err) {
            throw new InternalServerErrorException(err);
        }
    }

    /**
     * ### ISO code 로 장중이 아닌지 알아내기
     * - 장중이 아니면 true, 장중이면 false
     */
    async isNotMarketOpen(ISO_Code: string) {
        try {
            const session = await this.getSessionSomethingByISOcode(ISO_Code)
            const previous_open = new Date(session["previous_open"])
            const previous_close = new Date(session["previous_close"])
            const next_open = new Date(session["next_open"])
            const next_close = new Date(session["next_close"])
            if (previous_open > previous_close && next_open > next_close) { // 장중
                return false;
            }
            return true;
        } catch (err) {
            throw new InternalServerErrorException(err);
        }
    }

    /**
     * 
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

    async updatePriceByFilters(filterArr: object[]) {
        // db 에서 각 filter 들로 find 한 documents 들의 symbol 배열들을 만들어서 각각 updatePriceByTickerArr(symbol배열) 을 실행시켜!
        return Promise.all(filterArr.map(async (filter) => {
            return await this.yf_infoModel.find(filter, 'symbol').exec()
                .then(async (res) => {
                    const symbolArr = res.map(ele=>ele.symbol) // await this.updatePriceByTickerArr(res.map(ele=>ele.symbol)); <- 요로케 하면 안되요! // 내가 그냥 함수를 넣어버린게 되는건가? 그렇다면, 즉시실행함수형태로 하면 될거같은데?
                    return await this.updatePriceByTickerArr(symbolArr);
                })
                .catch((err) => {
                    // console.log(err);
                    return {findError: err};
                })
        }))
    }

    // async updatePriceAll(each: number) {
    //     this.getPriceByTickerList([]);
    //     return each;
    // }
}
