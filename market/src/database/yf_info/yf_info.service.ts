import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Yf_info, Yf_infoDocument } from "./yf_info.schema";
import Either, * as E from "src/common/class/either";

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

  public insertMany(
    yfInfoArr: readonly Yf_info[]
  ): Promise<Either<MongooseInsertManyError<Yf_info>, Yf_info[]>> {
    return E.wrapPromise(this.yf_infoModel.insertMany(
      yfInfoArr,
      { ordered: false }
    ));
  }

  public findAll() {
    return this.find(
      {},
      "-_id symbol shortName longName quoteType currency market exchange exchangeTimezoneName exchangeTimezoneShortName"
    );
  }

  private find(
    filter: object,
    projection?: object | string | Array<string>
  ) {
    const q = this.yf_infoModel.find(filter);
    if (projection) q.select(projection);
    return q.lean().exec();
  }

}
