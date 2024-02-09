import { Injectable } from "@nestjs/common";
import { InjectRedisRepository } from "../decorator";
import { ConfigService } from "@nestjs/config";
import { CachedPrice } from "./price.schema";
import { EnvironmentVariables } from "src/common/interface";
import { EnvKey } from "src/common/enum/envKey.emun";
import { Repository } from "../redis/redis.repository";
import * as F from "@fxts/core";

@Injectable()
// Todo: Refac
export class PriceService {

  private readonly minThreshold
  = this.configService.get(
    EnvKey.MinThreshold_priceCache,
    1,
    { infer: true }
  );

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
    // Todo1: 제너릭타입 CachedPriceI 말고 CachedPrice 쓸수 있도록 하기.
    @InjectRedisRepository(CachedPrice)
    private readonly priceRepo: Repository<CachedPriceI>,
  ) {}

  // 배열 받지말도록
  public create([symbol, price]: CacheSet<CachedPriceI>) {
    return this.priceRepo.createOne(symbol, price);
  }

  /**
   * ### this method calls the incr_count method of the cachedPrice
   * Todo: count 는 따로 키로 빼두고 카운팅 하는게 더 좋은 구조다.
   * Todo: findOne -> count -> updateOne
   */
  public read_with_counting(symbol: TickerSymbol) {
    return F.pipe(
      this.priceRepo.findOne(symbol),
      v => v && v.incr_count!(),
      v => v && this.priceRepo.updateOne(symbol, v)
    );
  }

  // 배열 받지말도록
  public update([symbol, update]: CacheUpdateSet<CachedPriceI>) {
    return this.priceRepo.updateOne(symbol, update);
  }

  public delete(symbol: TickerSymbol) {
    return this.priceRepo.deleteOne(symbol);
  }

  // 배열 받지말도록
  public isGteMinCount(set: PSet) {
    return F.pipe(
      this.priceRepo.findOne(F.head(set)),
      v => v && this.minThreshold <= v.count
    );
  }

}
