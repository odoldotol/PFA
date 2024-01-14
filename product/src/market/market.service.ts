// Todo: Refac

import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleInit
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { Pm2Service } from 'src/pm2/pm2.service';
import { MarketApiService } from './market-api/market-api.service';
import { MarketDate } from 'src/common/class/marketDate.class';
import * as F from '@fxts/core';

@Injectable()
export class MarketService
  implements OnModuleInit, OnApplicationBootstrap
{
  private readonly logger = new Logger(MarketService.name);

  constructor(
    private readonly dbSrv: DatabaseService,
    private readonly pm2Service: Pm2Service,
    private readonly marketApiSrv: MarketApiService
  ) {}

  async onModuleInit() {
    this.logger.warn("Initiator Run!!!");
    this.dbSrv.isInMemoryStore_AppMemory() ? // 필요 없지 않나?
      await this.restoreCache() :
      await this.selectiveCacheUpdate();
  }

  // 필요 없지 않나?
  onApplicationBootstrap() {
    this.dbSrv.isInMemoryStore_AppMemory() &&
    this.pm2Service.IS_RUN_BY_PM2 &&
      this.pm2Service.listenOldProcessCacheRecovery(this.restoreCache.bind(this));
    this.logger.warn("Initiator End!!!");
  };

  private async restoreCache() {
    await this.dbSrv.cacheRecovery()
    .then(this.selectiveCacheUpdate.bind(this))
    .catch(this.cacheHardInit.bind(this));
  }

  private async selectiveCacheUpdate() {
    await F.pipe(
      this.spAsyncIter(),
      F.reject(this.isSpLatest.bind(this)),
      F.map(this.withPriceSetArr.bind(this)),
      F.each(this.dbSrv.updatePriceBySpPSets.bind(this.dbSrv))
    ).then(() =>
      this.logger.verbose(`SelectiveUpdate Success`)
    ).catch(e => {
      this.logger.verbose(`SelectiveUpdate Failed`);
      this.logger.error(e);
      throw e
    });
  }

  private async cacheHardInit() {
    await F.pipe(
      this.spAsyncIter(),
      F.map(this.withPriceSetArr.bind(this)),
      F.each(this.dbSrv.cacheHardInit.bind(this.dbSrv))
    ).then(() =>
      this.logger.verbose(`CacheHardInit Success`)
    ).catch(error => {
      this.logger.verbose(`CacheHardInit Failed`);
      this.logger.error(error);
    });
  }

  private spAsyncIter() {
    return F.pipe(
      this.marketApiSrv.fetchAllSpDoc(), F.toAsync,
      F.map(this.spDocToSp)
    );
  }

  private spDocToSp(spDoc: StatusPrice) {
    return [spDoc.isoCode, MarketDate.fromSpDoc(spDoc)] as Sp;
  }

  private async isSpLatest(sp: Sp) {
    return MarketDate.areEqual(
      F.last(sp),
      await this.dbSrv.readCcStatusPrice(F.head(sp))
    );
  }

  private async withPriceSetArr(sp: Sp) {
    return [
      sp,
      await this.marketApiSrv.fetchPriceByISOcode(F.head(sp))
    ] as [Sp, PSet[]];
  }

  public updatePriceByExchange(ISO_Code: string, body: UpdatePriceByExchangeBodyI) {
    return this.dbSrv.updatePriceBySpPSets([
      [ISO_Code, new MarketDate(body.marketDate)],
      body.priceArrs
    ]);
  }

  public getPrice(ticker: string, id: string = "") {
    return F.pipe(
      [ticker, []] as GPSet,
      F.apply(this.readCache.bind(this)),
      F.apply(this.ifNoCache_setNew.bind(this)),
      F.apply(this.ifOutdated_updateIt.bind(this)),
      F.tap(this.Logger_GetPriceByTicker.bind(this, id)),
      this.takeLastFromSet,
    );
  }

  private async readCache(...[ticker, stack]: GPSet) {
    return [
      ticker,
      F.toArray(F.append(
        await this.dbSrv.readCcPriceCounting(ticker),
        stack
      ))
    ] as GPSet;
  }

  private async ifNoCache_setNew(...[ticker, stack]: GPSet) {
    return [
      ticker,
      F.toArray(F.append(
        F.isNil(F.head(stack)) &&
        await this.createPriceWithFetching(ticker),
        stack
      ))
    ] as GPSet;
  }

  private async ifOutdated_updateIt(...[ticker, stack]: GPSet) {
    return [
      ticker,
      F.toArray(F.append(
        F.isObject(F.head(stack)) &&
        F.not(await this.isPriceUpToDate(F.head(stack) as CachedPriceI)) &&
        await this.updateWithFetching(ticker),
        stack
      ))
    ] as GPSet;
  }

  private Logger_GetPriceByTicker(id: string, [ticker, stack]: GPSet) {
    return F.pipe(
      stack,
      F.map(a => a ? 1 : 0),
      F.toArray,
      F.join(""),
      F.tap(code => this.logger.verbose(`${ticker} : ${code}${id && " " + id}`))
    );
  }

  private takeLastFromSet(set: GPSet) {
    return F.pipe(
      F.last(set),
      F.filter(a => a),
      F.last
    );
  }

  private createPriceWithFetching(ticker: string) {
    return F.pipe(
      ticker,
      this.fetchPriceSet.bind(this),
      this.dbSrv.createCcPrice.bind(this.dbSrv)
    );
  }

  private async isPriceUpToDate(price: CachedPriceI) {
    return MarketDate.areEqual(
      price.marketDate,
      await this.dbSrv.readCcStatusPrice(price.ISO_Code)
    );
  }

  private updateWithFetching(ticker: string) {
    return F.pipe(
      ticker,
      this.fetchPriceUpdateSet.bind(this),
      this.dbSrv.updateCcPrice.bind(this.dbSrv)
    );
  }

  private fetchPriceSet(ticker: string) {
    return F.pipe(
      ticker,
      this.marketApiSrv.fetchPriceByTicker.bind(this.marketApiSrv),
      F.tap(this.dbSrv.createCcPriceStatusWithRP.bind(this.dbSrv)),
      async (rP) => [
        ticker,
        Object.assign(rP, {
          marketDate: await this.dbSrv.readCcStatusPrice(rP.ISO_Code),
          count: 1
        })
      ] as CacheSet<CachedPriceI>
    );
  }

  private fetchPriceUpdateSet(ticker: string) {
    return F.pipe(
      ticker,
      this.marketApiSrv.fetchPriceByTicker.bind(this.marketApiSrv),
      async (rP) => [ticker, F.pick(
        ["price", "marketDate"],
        Object.assign(rP, { marketDate: await this.dbSrv.readCcStatusPrice(rP.ISO_Code) }))
      ] as CacheUpdateSet<CachedPriceI>
    );
  }

  // getAllStatusPrice = async () => F.pipe(
  //   this.marketApiSrv.fetchAllSpDoc(), F.toAsync,
  //   F.map(sp => sp.isoCode),
  //   F.map(async c => [c, await this.dbSrv.readCcStatusPrice(c)] as Sp),
  //   F.fromEntries);

}
