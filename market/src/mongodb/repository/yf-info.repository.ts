import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Yf_info, Yf_infoDocument } from "../schema/yf_info.schema";
import { Model } from "mongoose";

@Injectable()
export class Yf_infoRepository {

    constructor(
        @InjectModel(Yf_info.name) private yf_infoModel: Model<Yf_infoDocument>,
    ) {}
    
    /**
     * ###
     * - updater.service.testGeneralInitiate
     */
    testPickOne(exchangeTimezoneName: string) {
        try {
            return this.findOne({exchangeTimezoneName}, "-_id symbol regularMarketPrice regularMarketPreviousClose regularMarketLastClose");
        } catch (error) {
            throw error;
        };
    }

    /**
     * ###
     * - updater.service.updatePriceByTickerArr
     */
    async updatePriceByArr(tickerArr: string[], priceArr: object[], lastClose: "regularMarketPreviousClose" | "regularMarketPrice") {
        try {
            const result = {success: [], failure: []};

            await Promise.all(tickerArr.map((ticker, idx) => {
                if (priceArr[idx]["error"]) {
                    priceArr[idx]['ticker'] = ticker;
                    result.failure.push(priceArr[idx]);
                } else {
                    const regularMarketPreviousClose = priceArr[idx]["regularMarketPreviousClose"];
                    const regularMarketPrice = priceArr[idx]["regularMarketPrice"];
                    const regularMarketLastClose = priceArr[idx][lastClose];
                    priceArr[idx]["regularMarketLastClose"] = regularMarketLastClose;

                    return this.yf_infoModel.updateOne(
                        {symbol: ticker},
                        {regularMarketPreviousClose, regularMarketPrice, regularMarketLastClose}
                    ).exec()
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
                    });
                };
            }));
            
            return result;
        } catch (error) {
            throw error;
        };
    }

    /**
     * ###
     * - updater.service.updatePriceByFilters
     */
    async getSymbolArr(filter: object) {
        try {
            return (await this.find(filter, '-_id symbol')).map(doc => doc.symbol);
        } catch (error) {
            throw error;
        };
    }

    /**
     * ###
     */
    existsByTicker(symbol: string) {
        try {
            return this.yf_infoModel.exists({symbol}).exec();
        } catch (error) {
            throw error;
        };
    }

    /**
     * ###
     */
    insertArr(arr) {
        try {
            return this.yf_infoModel.insertMany(arr, { ordered: false });
        } catch (error) {
            throw error;
        };
    }

    /**
     * ###
     */
    getPriceArr(exchangeTimezoneName: string) {
        try {
            return this.find({exchangeTimezoneName}, "-_id symbol regularMarketLastClose");
        } catch (error) {
            throw error;
        };
    }

    /**
     * ###
     */
    getPrice(symbol: string) {
        try {
            return this.findOne({ symbol }, "-_id regularMarketLastClose");
        } catch (error) {
            throw error;
        };
    }

    /**
     * ###
     */
    getAll() {
        try {
            return this.find({}, "-_id symbol shortName longName quoteType currency market exchange exchangeTimezoneName exchangeTimezoneShortName");
        } catch (error) {
            throw error;
        };
    }

    /**
     * ###
     */
    findOne(filter: object, projection?: object|string|Array<string>) {
        try {
            const q = this.yf_infoModel.findOne(filter)
            if (projection) q.select(projection);
            return q.lean().exec();
        } catch (error) {
            throw error;
        };
    }

    /**
     * ###
     */
    find(filter: object, projection?: object|string|Array<string>) {
        try {
            const q = this.yf_infoModel.find(filter)
            if (projection) q.select(projection);
            return q.lean().exec();
        } catch (error) {
            throw error;
        };
    }

}