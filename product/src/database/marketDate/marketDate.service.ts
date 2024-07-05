// Todo: Entity 변경에 따른 완전한 리팩터링 필요

import { Injectable } from "@nestjs/common";
import { InjectRedisRepository } from "../decorator";
import { MarketDate } from "./marketDate.schema";
import { Repository } from "../redis";
import { ExchangeCore, ExchangeIsoCode } from "src/common/interface";

@Injectable()
export class MarketDateService {

  constructor(
    @InjectRedisRepository(MarketDate)
    private readonly marketDateRepo: Repository<MarketDate>,
  ) {}

  // Todo: Redis Repository 수준에서 메서드로 제공해야함.
  public async updateOrCreate(
    isoCode: ExchangeIsoCode,
    marketDate: MarketDate
  ) {
    return (await this.update(isoCode, marketDate)) || this.create(isoCode, marketDate);
  }

  public create(
    isoCode: ExchangeIsoCode,
    marketDate: MarketDate
  ) {
    return this.marketDateRepo.createOne(isoCode, marketDate);
  }

  public read(isoCode: ExchangeIsoCode) {
    return this.marketDateRepo.findOne(isoCode);
  }

  public update(
    isoCode: ExchangeIsoCode,
    marketDate: MarketDate
  ) {
    return this.marketDateRepo.updateOne(isoCode, marketDate);
  }

  public async isUptodate(
    exchange: ExchangeCore
  ): Promise<boolean> {
    return MarketDate.areEqual(
      exchange.marketDate,
      await this.read(exchange.isoCode)
    );
  }

  // dev
  // public getAllAsMap() {
  //   return this.marketDateRepo.getAllKeyValueMap();
  // }

}
