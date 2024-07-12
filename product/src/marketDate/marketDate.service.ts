// Todo: Entity 변경에 따른 완전한 리팩터링 필요

import { Injectable } from "@nestjs/common";
import {
  InjectRedisRepository, 
  RedisCache, 
  RedisRepository
} from "../database";
import { MarketDateRedisEntity } from "./marketDate.redis.entity";
import {
  ExchangeCore,
  ExchangeIsoCode,
  FinancialAssetCore,
  MarketDate
} from "src/common/interface";

@Injectable()
export class MarketDateService {

  constructor(
    @InjectRedisRepository(MarketDateRedisEntity)
    private readonly marketDateRepo: RedisRepository<MarketDate>,
  ) {}

  /**
   * - exchange: null 인 asset => true (업데이트 하지 않기위해)
   * @todo [refac] exchange: null 인 asset 처리
   */
  public async isUptodate(
    arg: ExchangeCore | FinancialAssetCore
  ): Promise<boolean> {
    let marketDate: MarketDate;
    let isoCode: ExchangeIsoCode | null;
    if ('exchange' in arg) {
      isoCode = arg.exchange;
      marketDate = arg.marketDate;
    } else {
      isoCode = arg.isoCode;
      marketDate = arg.marketDate;
    }

    if (isoCode === null) {
      return true;
    } else {
      // 찾는거, 없으면 fetch 해보는거?
      const marketDateCache = await this.marketDateRepo.findOne(isoCode);
      if (marketDateCache) {
        return marketDateCache.isEqualTo(marketDate);
      } else {
        return false;
      }
    }
  }

  ////////////////////////////////////////////////////////

  public updateOrCreate(
    isoCode: ExchangeIsoCode,
    marketDate: MarketDate
  ): Promise<RedisCache<MarketDate>> {
    return this.marketDateRepo.updateOrCreateOne(isoCode, marketDate);
  }

  // public create(
  //   isoCode: ExchangeIsoCode,
  //   marketDate: MarketDate
  // ): Promise<RedisCache<MarketDate>> {
  //   return this.marketDateRepo.createOne(isoCode, marketDate);
  // }

  // public read(isoCode: ExchangeIsoCode): Promise<RedisCache<MarketDate> | null> {
  //   return this.marketDateRepo.findOne(isoCode);
  // }

  public update(
    isoCode: ExchangeIsoCode,
    marketDate: MarketDate
  ): Promise<RedisCache<MarketDate>> {
    return this.marketDateRepo.findOneAndUpdate(isoCode, marketDate);
  }

  // dev
  // public getAllAsMap() {
  //   return this.marketDateRepo.getAllKeyValueMap();
  // }

}
