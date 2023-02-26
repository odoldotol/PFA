import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ClientSession, Model } from "mongoose";
import { Status_price, Status_priceDocument } from "../schema/status_price.schema";

@Injectable()
export class Status_priceRepository {

    constructor(
        @InjectModel(Status_price.name) private status_priceModel: Model<Status_priceDocument>,
    ) {}
    
    /**
     * ISO code 로 Status_price leanDoc 하나 가져오기
     */
    findOneByISOcode = (ISO_Code: string) => this.status_priceModel.findOne({ ISO_Code }).lean().exec();

    /**
     * ### findAll
     */
    findAll = () => this.status_priceModel.find().lean().exec();

    /**
     * ### FindOne By ISO_Code And Update LastMarketDate
     */
    updateByRegularUpdater = (ISO_Code: string, previous_close: string, session?: ClientSession) => 
        this.status_priceModel.findOneAndUpdate(
            { ISO_Code },
            { lastMarketDate: new Date(previous_close).toISOString() },
            { new: true }
        ).session(session ? session : null).lean().exec();

    /**
     * ### exists
     */
    exists = (filter: object) => this.status_priceModel.exists(filter).exec();

    /**
     * ### createOne
     */
    createOne = (ISO_Code: string, lastMarketDate: string, yf_exchangeTimezoneName: string) =>
        new this.status_priceModel({
            ISO_Code,
            lastMarketDate,
            yf_exchangeTimezoneName,
        }).save();

}