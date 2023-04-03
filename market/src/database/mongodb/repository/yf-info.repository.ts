// 대부분의 메써드가 Exs 에서 대체되어야함

import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Yf_info, Yf_infoDocument } from "../schema/yf_info.schema";
import { ClientSession, Model } from "mongoose";

@Injectable()
export class Yf_infoRepository {

    constructor(
        @InjectModel(Yf_info.name) private model: Model<Yf_infoDocument>,
    ) {}
    
    // [DEV]
    testPickOne = (exchangeTimezoneName: string) => this.findOne({ exchangeTimezoneName },
        "-_id symbol regularMarketPrice regularMarketPreviousClose regularMarketLastClose");

    updatePrice = (symbol: string, price: FulfilledPrice, session?: ClientSession) =>
        this.model.updateOne({ symbol }, price).session(session ? session : null).exec();

    exists = (symbol: string) => this.model.exists({ symbol }).exec();

    insertMany = (arr: FulfilledYfInfo[]) => this.model.insertMany(arr, { ordered: false });

    findPricesByExchange = (exchangeTimezoneName: string) => this.find({ exchangeTimezoneName },
        "-_id symbol regularMarketLastClose currency quoteType");

    findPriceBySymbol = (symbol: string)  => this.findOne({ symbol },
        "-_id regularMarketLastClose exchangeTimezoneName currency quoteType");

    findAll = () => this.find({},
        "-_id symbol shortName longName quoteType currency market exchange exchangeTimezoneName exchangeTimezoneShortName");

    findOne = (filter: object, projection?: object|string|Array<string>) => {
        const q = this.model.findOne(filter)
        if (projection) q.select(projection);
        return q.lean().exec();};

    find = (filter: object, projection?: object|string|Array<string>) => {
        const q = this.model.find(filter)
        if (projection) q.select(projection);
        return q.lean().exec();};

}