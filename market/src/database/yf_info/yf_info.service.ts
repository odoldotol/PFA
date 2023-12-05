import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ClientSession, Model } from "mongoose";
import { Either } from "src/common/class/either";
import { Yf_info, Yf_infoDocument } from "./yf_info.schema";

// temp
type MongooseInsertManyError<T = any> = {
  writeErrors: any[],
  insertedDocs: T[]
}

@Injectable()
export class YfinanceInfoService {

  constructor(
    @InjectModel(Yf_info.name) private yf_infoModel: Model<Yf_infoDocument>,
  ) {}

  // // [DEV]
  // testPickOne = (exchangeTimezoneName: string) => this.findOne({ exchangeTimezoneName },
  //     "-_id symbol regularMarketPrice regularMarketPreviousClose regularMarketLastClose");

  // exists = (symbol: string) => this.yf_infoModel.exists({ symbol }).exec();

  public insertMany(arr: readonly Yf_info[]): Promise<Either<MongooseInsertManyError<Yf_info>, Yf_info[]>> {
    return this.yf_infoModel.insertMany(arr, { ordered: false })
      .then(<T>(res: T) => Either.right<MongooseInsertManyError, T>(res))
      .catch(err => Either.left(err));
  }

  // findPricesByExchange = (exchangeTimezoneName: string) => this.find({ exchangeTimezoneName },
  //     "-_id symbol regularMarketLastClose currency quoteType");

  // findPriceBySymbol = (symbol: string)  => this.findOne({ symbol },
  //     "-_id regularMarketLastClose exchangeTimezoneName currency quoteType");

  public findAll() {
    return this.find(
      {},
      "-_id symbol shortName longName quoteType currency market exchange exchangeTimezoneName exchangeTimezoneShortName"
    );
  }

  // findOne = (filter: object, projection?: object|string|Array<string>) => {
  //     const q = this.yf_infoModel.findOne(filter)
  //     if (projection) q.select(projection);
  //     return q.lean().exec();};

  private find(filter: object, projection?: object | string | Array<string>) {
    const q = this.yf_infoModel.find(filter);
    if (projection) q.select(projection);
    return q.lean().exec();
  };

}
