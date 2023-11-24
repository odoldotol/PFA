import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ClientSession, FilterQuery, Model } from "mongoose";
import { Log_priceUpdate, Log_priceUpdateDocument } from "./log_priceUpdate.schema";

@Injectable()
export class LogPriceUpdateService {

  constructor(
    @InjectModel(Log_priceUpdate.name) private log_priceUpdateModel: Model<Log_priceUpdateDocument>,
  ) {}

  public create(
    newDoc: Log_priceUpdate,
    session?: ClientSession
  ) {
    return new this.log_priceUpdateModel(newDoc)
      .save({ session: session? session : null });
  }

  public search(
    filter?: FilterQuery<Log_priceUpdateDocument>,
    limit: number = 1
  ) {
    return this.log_priceUpdateModel.find(filter || {})
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
      .exec();
  }

}
