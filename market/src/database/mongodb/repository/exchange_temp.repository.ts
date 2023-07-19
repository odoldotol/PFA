import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import {
  ClientSession,
  FilterQuery,
  Model,
  UpdateQuery
} from "mongoose";
import { Exchange, ExchangeDocument } from "../schema/exchange_temp.schema";

@Injectable()
export class ExchangeRepository {

  constructor(
    @InjectModel(Exchange.name) private status_priceModel: Model<ExchangeDocument>,
  ) {}

  public findOneByISOcode(ISO_Code: string) {
    return this.status_priceModel.findOne({ ISO_Code }).lean().exec();
  }

  public findAll() {
    return this.status_priceModel.find().lean().exec();
  }

  public findOneAndUpdate(
    filter: FilterQuery<ExchangeDocument>,
    update: UpdateQuery<ExchangeDocument>,
    session?: ClientSession
  ) {
    return this.status_priceModel.findOneAndUpdate(filter, update, { new: true })
    .session(session ? session : null).lean().exec();
  }

  public exists(filter: FilterQuery<ExchangeDocument>) {
    return this.status_priceModel.exists(filter).exec();
  }

  public createOne(
    ISO_Code: string,
    lastMarketDate: string,
    yf_exchangeTimezoneName: string
  ) {
    return new this.status_priceModel({
      ISO_Code,
      lastMarketDate,
      yf_exchangeTimezoneName
    }).save();
  }

}