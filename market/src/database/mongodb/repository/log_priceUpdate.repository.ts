import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ClientSession, FilterQuery, Model } from "mongoose";
import { Log_priceUpdate, Log_priceUpdateDocument } from "../schema/log_priceUpdate.schema";

@Injectable()
export class Log_priceUpdateRepository {

    constructor(
        @InjectModel(Log_priceUpdate.name) private model: Model<Log_priceUpdateDocument>,
    ) {}
    
    create = (newDoc: Log_priceUpdate, session?: ClientSession) =>
        new this.model(newDoc).save({session: session? session : null});

    find1 = (filter?: FilterQuery<Log_priceUpdateDocument>, limit: number = 1) =>
        this.model.find(filter).sort({createdAt: -1}).limit(limit).lean().exec();
}