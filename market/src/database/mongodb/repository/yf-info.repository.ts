import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Yf_info, Yf_infoDocument } from "../schema/yf_info.schema";
import { ClientSession, Model } from "mongoose";

@Injectable()
export class Yf_infoRepository {

    constructor(
        @InjectModel(Yf_info.name) private yf_infoModel: Model<Yf_infoDocument>,
    ) {}
    
    /**
     * ### testPickOne
     */
    testPickOne = (exchangeTimezoneName: string) => this.findOne(
        {exchangeTimezoneName},
        "-_id symbol regularMarketPrice regularMarketPreviousClose regularMarketLastClose"
    );

    /**
     * ### updatePrice
     */
    updatePrice = (symbol: string, price: FulfilledPrice, session?: ClientSession) => this.yf_infoModel.updateOne({symbol}, price).session(session ? session : null).exec();

    /**
     * ### exists
     */
    exists = (symbol: string) => this.yf_infoModel.exists({symbol}).exec();

    /**
     * ### insertMany
     */
    insertMany = (arr: Yf_info[]) => this.yf_infoModel.insertMany(arr, { ordered: false });

    /**
     * ### findPricesByExchange
     */
    findPricesByExchange = (exchangeTimezoneName: string) => this.find({exchangeTimezoneName}, "-_id symbol regularMarketLastClose currency quoteType");

    /**
     * ### findPriceBySymbol
     */
    findPriceBySymbol = (symbol: string)  => this.findOne({ symbol }, "-_id regularMarketLastClose exchangeTimezoneName currency quoteType");

    /**
     * ### findAll
     */
    findAll = () => this.find({}, "-_id symbol shortName longName quoteType currency market exchange exchangeTimezoneName exchangeTimezoneShortName");

    /**
     * ### findOne
     */
    findOne(filter: object, projection?: object|string|Array<string>) {
        const q = this.yf_infoModel.findOne(filter)
        if (projection) q.select(projection);
        return q.lean().exec();
    }

    /**
     * ### find
     */
    find(filter: object, projection?: object|string|Array<string>) {
        const q = this.yf_infoModel.find(filter)
        if (projection) q.select(projection);
        return q.lean().exec();
    }

}