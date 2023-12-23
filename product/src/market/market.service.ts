import { Injectable, Logger, OnApplicationBootstrap, OnModuleInit } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { Pm2Service } from 'src/pm2/pm2.service';
import { MarketApiService } from './market-api/market-api.service';
import { MarketDate } from 'src/common/class/marketDate.class';
import { append, apply, compact, compactObject, concurrent, curry, delay, drop, each, entries, filter, flat, fromEntries, head, isNil, isObject, isString, isUndefined, join, last, map, not, nth, partition, peek, pick, pipe, reduce, reject, tap, toArray, toAsync } from '@fxts/core';
import { CachedPrice } from 'src/common/class/cachedPrice.class'; //

@Injectable()
export class MarketService implements OnModuleInit, OnApplicationBootstrap {

    private readonly logger = new Logger(MarketService.name);

    constructor(
        private readonly dbSrv: DatabaseService,
        private readonly pm2Service: Pm2Service,
        private readonly marketApiSrv: MarketApiService
    ) {}

    onModuleInit = async () => {
        this.logger.warn("Initiator Run!!!");
        this.dbSrv.isInMemoryStore_AppMemory() ?
            await this.restoreCache() :
            await this.selectiveCacheUpdate();};

    onApplicationBootstrap = () => {
        this.dbSrv.isInMemoryStore_AppMemory() && this.pm2Service.IS_RUN_BY_PM2 &&
            this.pm2Service.cacheRecoveryListener(this.restoreCache);
        this.logger.warn("Initiator End!!!");};

    private restoreCache = () => this.dbSrv.cacheRecovery()
        .then(this.selectiveCacheUpdate)
        .catch(this.cacheHardInit);

    private selectiveCacheUpdate = () => pipe(
        this.spAsyncIter(),
        reject(this.isSpLatest),
        map(this.withPriceSetArr),
        each(this.dbSrv.updatePriceBySpPSets)
    ).then(() => this.logger.verbose(`SelectiveUpdate Success`))
    .catch(e => {this.logger.error(e), this.logger.error(`SelectiveUpdate Failed`); throw e});

    private cacheHardInit = () => pipe(
        this.spAsyncIter(),
        map(this.withPriceSetArr),
        each(this.dbSrv.cacheHardInit)
    ).then(() => this.logger.verbose(`CacheHardInit Success`))
    .catch(error => (this.logger.error(error), this.logger.error(`CacheHardInit Failed`)));

    private spAsyncIter = () => pipe(
        this.marketApiSrv.fetchAllSpDoc(), toAsync,
        map(this.spDocToSp));

    private spDocToSp = (spDoc: StatusPrice) => [ spDoc.isoCode, MarketDate.fromSpDoc(spDoc) ] as Sp;

    private isSpLatest = async (sp: Sp) => MarketDate.areEqual(last(sp), await this.dbSrv.readCcStatusPrice(head(sp)));

    private withPriceSetArr = async (sp: Sp) => [ sp, await this.marketApiSrv.fetchPriceByISOcode(head(sp)) ] as [Sp, PSet[]];

    updatePriceByExchange = (ISO_Code: string, body: UpdatePriceByExchangeBodyI) => 
        this.dbSrv.updatePriceBySpPSets([[ ISO_Code, new MarketDate(body.marketDate) ], body.priceArrs]); // 그냥 spDoc 이랑 priceArrs 을 받으면 깔끔한데, 마켓서버도 괜히 구조분해해서 쓰지말고 spDoc이 통째로 흘러가면서 작업하는게 좋지 않을까?

    getPrice = async (ticker: string, id: string = "") => pipe(
        [ ticker, [] ] as GPSet,
        apply(this.readCache),
        apply(this.ifNoCache_setNew),
        apply(this.ifOutdated_updateIt),
        tap(this.Logger_GetPriceByTicker(id)),
        this.takeLastFromSet);

    private readCache = async (...[ ticker, stack ]: GPSet) =>
        [ ticker, toArray(append(
            await this.dbSrv.readCcPriceCounting(ticker), stack)) ] as GPSet;

    private ifNoCache_setNew = async (...[ ticker, stack ]: GPSet) =>
        [ ticker, toArray(append(
            isNil(head(stack)) &&
            await this.createPriceWithFetching(ticker), stack as CachedPrice[])) ] as GPSet; // TODO - Refac
    
    private ifOutdated_updateIt = async (...[ ticker, stack ]: GPSet) =>
        [ ticker, toArray(append(
            isObject(head(stack)) &&
            not(await this.isPriceUpToDate(head(stack) as CachedPriceI)) &&
            await this.updateWithFetching(ticker), stack)) ] as GPSet;

    private Logger_GetPriceByTicker = curry(
        (id: string, [ ticker, stack ]: GPSet) => pipe(stack,
            map(a => a ? 1 : 0),
            toArray,
            join(""),
            tap(code => this.logger.verbose(`${ticker} : ${code}${id && " "+id}`))));

    private takeLastFromSet = (set: GPSet) => pipe(last(set),
        filter(a => a),
        last);

    private createPriceWithFetching = (ticker: string) => pipe(ticker,
        this.fetchPriceSet,
        this.dbSrv.createCcPrice.bind(this.dbSrv));

    private isPriceUpToDate = async (price: CachedPriceI) =>
        MarketDate.areEqual(price.marketDate, await this.dbSrv.readCcStatusPrice(price.ISO_Code));

    private updateWithFetching = (ticker: string) => pipe(ticker,
        this.fetchPriceUpdateSet,
        this.dbSrv.updateCcPrice.bind(this.dbSrv));

    // TODO - Refac
    private fetchPriceSet = (ticker: string) => pipe(ticker,
        this.marketApiSrv.fetchPriceByTicker,
        tap(this.dbSrv.createCcPriceStatusWithRP),
        async (rP) => [
            ticker,
            Object.assign(rP, {
                marketDate: await this.dbSrv.readCcStatusPrice(rP.ISO_Code),
                count: 1})
        ] as CacheSet<CachedPriceI>);

    // TODO - Refac
    private fetchPriceUpdateSet = (ticker: string) => pipe(ticker,
        this.marketApiSrv.fetchPriceByTicker,
        async (rP) => [ ticker, pick(
            ["price", "marketDate"],
            Object.assign(rP, { marketDate: await this.dbSrv.readCcStatusPrice(rP.ISO_Code) }))
        ] as CacheUpdateSet<CachedPriceI>);

    getAllStatusPrice = async () => pipe(
        this.marketApiSrv.fetchAllSpDoc(), toAsync,
        map(sp => sp.isoCode),
        map(async c => [c, await this.dbSrv.readCcStatusPrice(c)] as Sp),
        fromEntries);

}
