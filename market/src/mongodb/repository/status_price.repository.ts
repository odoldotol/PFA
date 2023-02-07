import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Status_price, Status_priceDocument } from "../schema/status_price.schema";

@Injectable()
export class Status_priceRepository {

    constructor(
        @InjectModel(Status_price.name) private status_priceModel: Model<Status_priceDocument>,
    ) {}
    
    /**
     * ISO code 로 Status_price leanDoc 하나 가져오기
     */
    findOneByISOcode(ISO_Code: string) {
        try {
            return this.status_priceModel.findOne({ ISO_Code }).lean().exec();
        } catch (err) {
            throw err
        };
    }

    /**
     * ###
     */
    findAll() {
        try {
            return this.status_priceModel.find().lean().exec();
        } catch (err) {
            throw err
        };
    }

    /**
     * ### FindOne By ISO_Code And Update LastMarketDate
     */
    updateByRegularUpdater(ISO_Code: string, previous_close: string) {
        try {
            return this.status_priceModel.findOneAndUpdate(
                { ISO_Code },
                { lastMarketDate: new Date(previous_close).toISOString() },
                { new: true }
            ).lean().exec();
        } catch (err) {
            throw err
        };
    }

    /**
     * ###
     */
    exsits(filter: object) {
        try {
            return this.status_priceModel.exists(filter).exec();
        } catch (err) {
            throw err
        };
    }

    /**
     * ###
     */
    create(ISO_Code: string, previous_close: string, yf_exchangeTimezoneName: string) {
        try {
            const newOne = new this.status_priceModel({
                ISO_Code,
                lastMarketDate: new Date(previous_close).toISOString(),
                yf_exchangeTimezoneName,
            });
            return newOne.save();
        } catch (err) {
            throw err
        };
    }

}