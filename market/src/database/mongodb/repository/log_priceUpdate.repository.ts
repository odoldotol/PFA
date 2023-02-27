import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ClientSession, Model } from "mongoose";
import { Log_priceUpdate, Log_priceUpdateDocument } from "../schema/log_priceUpdate.schema";

@Injectable()
export class Log_priceUpdateRepository {

    constructor(
        @InjectModel(Log_priceUpdate.name) private log_priceUpdateModel: Model<Log_priceUpdateDocument>,
    ) {}
    
    /**
     * ### log_priceUpdate Doc 생성 By launcher, updateResult, key
     */
    create = (newDoc: Log_priceUpdate, session?: ClientSession) => new this.log_priceUpdateModel(newDoc).save({session: session? session : null});

    /**
     * ### testPickLastOne
     */
    testPickLastOne = (key: string) => this.log_priceUpdateModel.find({key}).sort({createdAt: -1}).limit(1).lean().exec();

}