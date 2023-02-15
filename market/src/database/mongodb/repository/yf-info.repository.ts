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
     */
    updatePrice(symbol: string, price: FulfilledYfPrice) {
        try {
            return this.yf_infoModel.updateOne({symbol}, price).exec();
        } catch (error) {
            throw error;
        };
    }

    /**
     * ###
     */
    exists(symbol: string) {
        try {
            return this.yf_infoModel.exists({symbol}).exec();
        } catch (error) {
            throw error;
        };
    }

    /**
     * ###
     */
    insertMany(arr: Yf_info[]) {
        try {
            return this.yf_infoModel.insertMany(arr, { ordered: false });
        } catch (error) {
            throw error;
        };
    }

    /**
     * ###
     */
    findPricesByExchange(exchangeTimezoneName: string) {
        try {
            return this.find({exchangeTimezoneName}, "-_id symbol regularMarketLastClose");
        } catch (error) {
            throw error;
        };
    }

    /**
     * ###
     */
    findPriceBySymbol(symbol: string) {
        try {
            return this.findOne({ symbol }, "-_id regularMarketLastClose exchangeTimezoneName");
        } catch (error) {
            throw error;
        };
    }

    /**
     * ###
     */
    findAll() {
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