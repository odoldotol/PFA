import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Log_priceUpdate, Log_priceUpdateDocument } from "../schema/log_priceUpdate.schema";

@Injectable()
export class Log_priceUpdateRepository {

    constructor(
        @InjectModel(Log_priceUpdate.name) private log_priceUpdateModel: Model<Log_priceUpdateDocument>,
    ) {}
    
    /**
     * ### log_priceUpdate Doc 생성 By launcher, updateResult, key
     */
    create(launcher: string, updateResult, key: string | Array<string | Object>) {
        try {
            const {startTime, endTime} = updateResult;
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
            });

            return newLog.save();
        } catch (err) {
            throw err
        };
    }

    /**
     * ###
     */
    testPickLastOne(key: string) {
        return this.log_priceUpdateModel.find({key}).sort({createdAt: -1}).limit(1).lean().exec();
    }

}