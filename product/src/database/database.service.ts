// Todo: 제거

import { Injectable, Logger } from "@nestjs/common";
import { InMemoryService } from "./inMemory/inMemory.service";
import { MarketDateService } from "./inMemory/marketDate.service";
import { PriceService } from "./inMemory/price.service";
import { MarketDate } from "src/common/class/marketDate.class";
import * as F from "@fxts/core";

@Injectable()
export class DatabaseService {

  private readonly logger = new Logger(DatabaseService.name);

  constructor(
    private readonly inMemorySrv: InMemoryService,
    private readonly marketDateSrv: MarketDateService,
    private readonly priceSrv: PriceService
  ) {}

  public createCcPriceStatusWithRP(rP: RequestedPrice) {
    return rP.newExchange &&
    this.marketDateSrv.create([
      rP.newExchange.isoCode,
      MarketDate.fromSpDoc(rP.newExchange)
    ]);
  }

  public createCcPrice(arg: CacheSet<CachedPriceI>) {
    return this.priceSrv.create(arg);
  }

  public readCcStatusPrice(ISO_Code: string) {
    return this.marketDateSrv.read(ISO_Code);
  }

  public readCcPriceCounting(arg: TickerSymbol) {
    return this.priceSrv.read_with_counting(arg);
  }

  public updateCcPrice(arg: CacheUpdateSet<CachedPriceI>) {
    return this.priceSrv.update(arg);
  }

  public cacheRecovery() {
    return this.inMemorySrv.localFileCacheRecovery();
  }

  public getAllCcKeys() {
    return this.inMemorySrv.getAllKeys();
  }

  public getAllMarketDateAsMap() {
    return this.marketDateSrv.getAllAsMap();
  }

  // TODO: 각 업데이트 Asset이 해당 Sp 에 속한게 맞는지 검사하고 있지 않다. 이거 문제될 가능성 있는지 찾아봐.
  public updatePriceBySpPSets(initSet: SpPSets) {
    return F.pipe(
      initSet,
      this.setSpAndReturnPSets.bind(this), F.toAsync,
      F.partition(this.priceSrv.isGteMinCount.bind(this.priceSrv)),
      ([updatePSets, deletePSets]) => {
        F.pipe(updatePSets,
          F.map(this.toCacheUpdateSet.bind(this, F.head(initSet))),
          F.each(this.updateCcPrice.bind(this))
        );
        F.pipe(deletePSets,
          F.each(a => this.priceSrv.delete(F.head(a)))
        );
      },
    ).then(() => this.logger.verbose(`${F.head(F.head(initSet))} : Regular Updated`));
  }

  public cacheHardInit(initSet: SpPSets) {
    return F.pipe(initSet,
      this.setSpAndReturnPSets.bind(this),
      F.map(this.toCachedPriceSet.bind(this, F.head(initSet))),
      F.each(this.createCcPrice.bind(this))
    );
  }

  private setSpAndReturnPSets(initSet: SpPSets) {
    return F.pipe(initSet,
      F.tap(async set => {
        return await this.marketDateSrv.update(F.head(set)) ||
        this.marketDateSrv.create(F.head(set))
      }),
      F.last
    );
  }

  // Todo: Refac - toCacheUpdateSet, toCachedPriceSet 중복함수
  private toCachedPriceSet(
    [ISO_Code, marketDate]: Sp, priceSet: PSet
  ): CacheSet<CachedPriceI> {
    return [F.head(priceSet), F.compactObject({
      price: priceSet[1],
      ISO_Code,
      currency: priceSet[2] ? priceSet[2] : undefined,
      marketDate,
      count: 0
    })] as CacheSet<CachedPriceI>;
  }

  private toCacheUpdateSet([ISO_Code, marketDate]: Sp, priceSet: PSet): CacheUpdateSet<CachedPriceI> {
    return [F.head(priceSet), F.compactObject({
      price: priceSet[1],
      ISO_Code,
      currency: priceSet[2] ? priceSet[2] : undefined,
      marketDate,
      count: 0
    })] as CacheUpdateSet<CachedPriceI>;
  }

  public isInMemoryStore_AppMemory() {
    return this.inMemorySrv.isUseingAppMemory();
  }

}
