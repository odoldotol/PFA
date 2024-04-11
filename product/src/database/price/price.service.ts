// Todo: Entity 변경에 따른 완전한 리팩터링 필요

import { Injectable } from "@nestjs/common";
import { InjectRedisRepository } from "../decorator";
import { CachedPrice } from "./price.schema";
import { MarketDate } from "../marketDate/marketDate.schema";
import {
  ExchangeIsoCode,
  PriceTuple,
  Ticker
} from "src/common/interface";
import { AssetConfigService } from "src/config";
import { Repository } from "../redis";
import * as F from "@fxts/core";

@Injectable()
export class PriceService {

  private readonly minThreshold = this.assetConfigSrv.getPriceThreshold();

  constructor(
    private readonly assetConfigSrv: AssetConfigService,
    @InjectRedisRepository(CachedPrice)
    private readonly priceRepo: Repository<CachedPrice>,
  ) {}

  // Todo: 결과 리턴
  public async updateOrDelete(
    isoCode: ExchangeIsoCode,
    marketDate: MarketDate,
    priceTupleArr: PriceTuple[]
  ) {
    await Promise.all(priceTupleArr.map(async tuple => {
      // check count
      await this.isGteMinCount(tuple[0]) ?
        // update || delete Price
        await this.update(
          tuple[0],
          F.compactObject({
            price: tuple[1],
            ISO_Code: isoCode,
            currency: tuple[2],
            marketDate,
            count: 0
          })
        ) :
        await this.delete(tuple[0]);
    }));
  }

  public create(
    symbol: Ticker,
    price: CachedPrice) {
    return this.priceRepo.createOne(symbol, price);
  }

  /**
   * ### this method calls the incr_count method of the cachedPrice
   * Todo: count 는 따로 키로 빼두고 카운팅 하는게 더 좋은 구조다.
   * Todo: findOne -> count -> updateOne
   */
  public readWithCounting(symbol: Ticker) {
    return F.pipe(
      this.priceRepo.findOne(symbol),
      v => v && v.incr_count!(),
      v => v && this.priceRepo.updateOne(symbol, v)
    );
  }

  public update(
    symbol: Ticker,
    update: Partial<CachedPrice>) {
    return this.priceRepo.updateOne(symbol, update);
  }

  public delete(symbol: Ticker) {
    return this.priceRepo.deleteOne(symbol);
  }

  public isGteMinCount(symbol: Ticker) {
    return F.pipe(
      this.priceRepo.findOne(symbol),
      v => v && this.minThreshold <= v.count
    );
  }
}
