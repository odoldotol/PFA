import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ClientSession, Model } from "mongoose";
import { Yf_info, Yf_infoDocument } from "./yf_info.schema";

@Injectable()
export class Yf_infoService {

    constructor(
        @InjectModel(Yf_info.name) private yf_infoModel: Model<Yf_infoDocument>,
    ) {}
    
    // [DEV]
    testPickOne = (exchangeTimezoneName: string) => this.findOne({ exchangeTimezoneName },
        "-_id symbol regularMarketPrice regularMarketPreviousClose regularMarketLastClose");

    updatePrice = (symbol: string, price: FulfilledPrice, session?: ClientSession) =>
        this.yf_infoModel.updateOne({ symbol }, price).session(session ? session : null).exec();

    exists = (symbol: string) => this.yf_infoModel.exists({ symbol }).exec();

    insertMany = (arr: FulfilledYfInfo[]) => this.yf_infoModel.insertMany(arr, { ordered: false });

    findPricesByExchange = (exchangeTimezoneName: string) => this.find({ exchangeTimezoneName },
        "-_id symbol regularMarketLastClose currency quoteType");

    findPriceBySymbol = (symbol: string)  => this.findOne({ symbol },
        "-_id regularMarketLastClose exchangeTimezoneName currency quoteType");

    findAll = () => this.find({},
        "-_id symbol shortName longName quoteType currency market exchange exchangeTimezoneName exchangeTimezoneShortName");

    findOne = (filter: object, projection?: object|string|Array<string>) => {
        const q = this.yf_infoModel.findOne(filter)
        if (projection) q.select(projection);
        return q.lean().exec();};

    find = (filter: object, projection?: object|string|Array<string>) => {
        const q = this.yf_infoModel.find(filter)
        if (projection) q.select(projection);
        return q.lean().exec();};

}