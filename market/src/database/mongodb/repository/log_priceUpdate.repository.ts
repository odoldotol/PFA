import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ClientSession, FilterQuery, Model } from "mongoose";
import { Log_priceUpdate, Log_priceUpdateDocument } from "../schema/log_priceUpdate.schema";

@Injectable()
export class Log_priceUpdateRepository {

    constructor(
        @InjectModel(Log_priceUpdate.name) private log_priceUpdateModel: Model<Log_priceUpdateDocument>,
    ) {}
    
    create = (newDoc: Log_priceUpdate, session?: ClientSession) => new this.log_priceUpdateModel(newDoc).save({session: session? session : null});

    find1 = (filter?: FilterQuery<Log_priceUpdateDocument>, limit: number = 1) => this.log_priceUpdateModel.find(filter).sort({createdAt: -1}).limit(limit).lean().exec();
}