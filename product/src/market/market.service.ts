import { BadRequestException, Injectable, InternalServerErrorException, Logger, OnApplicationBootstrap, OnModuleInit } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom } from 'rxjs';
import { spawn } from 'child_process';
import { DBRepository } from '../database/database.repository';
import { Pm2Service } from '../pm2/pm2.service';
import { MarketDate } from '../class/marketDate.class';
import { append, apply, compactObject, concurrent, curry, delay, each, entries, filter, head, isNil, isObject, isUndefined, last, map, not, nth, partition, peek, pick, pipe, reduce, reject, tap, toArray, toAsync } from '@fxts/core';

@Injectable()
export class MarketService implements OnModuleInit, OnApplicationBootstrap {

    private readonly logger = new Logger(MarketService.name);
    private readonly MARKET_URL = this.configService.get('MARKET_URL');
    private readonly TEMP_KEY: string = this.configService.get('TEMP_KEY');

    constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
        private readonly dbRepo: DBRepository,
        private readonly pm2Service: Pm2Service,
    ) {}

    async onModuleInit() {
        this.logger.warn("Initiator Run!!!");
        await this.restoreCache();
    }

    onApplicationBootstrap() {
        this.pm2Service.IS_RUN_BY_PM2 && this.pm2Service.cacheRecoveryListener(this.restoreCache);
        this.logger.warn("Initiator End!!!");
    }

    private restoreCache = () => this.dbRepo.cacheRecovery()
        .then(this.selectiveCacheUpdate)
        .catch(this.cacheHardInit);

    private selectiveCacheUpdate = () => pipe(
        this.spAsyncIter(),
        reject(this.isSpLatest),
        map(this.withPriceSetArr),
        each(this.dbRepo.regularUpdater)
    ).then(() => this.logger.verbose(`SelectiveUpdate Success`))
    .catch(e => {this.logger.error(e), this.logger.error(`SelectiveUpdate Failed`); throw e});

    private cacheHardInit = () => pipe(
        this.spAsyncIter(),
        map(this.withPriceSetArr),
        each(this.dbRepo.cacheHardInit)
    ).then(() => this.logger.verbose(`CacheHardInit Success`))
    .catch(error => (this.logger.error(error), this.logger.error(`CacheHardInit Failed`)));

    private spAsyncIter = () => pipe(
        this.requestSpDocArrToMarket(), toAsync,
        map(this.spDocToSp));

    private spDocToSp = (spDoc: StatusPrice) => [ spDoc.ISO_Code, MarketDate.fromSpDoc(spDoc) ] as Sp;

    private isSpLatest = async (sp: Sp) => last(sp).isEqualTo(await this.dbRepo.getCcPriceStatus(head(sp)));

    private withPriceSetArr = async (sp: Sp) => [ sp, await this.requestPriceByISOcode(head(sp)) ] as [Sp, PSet2[]];

    regularUpdater =  this.dbRepo.regularUpdater;

    getPriceByTicker = (ticker: string, id?: string) => pipe(
        [] as CachedPriceI[],
        tap(this.readCache(ticker)),
        tap(this.ifNoCache_setNew(ticker)),
        tap(this.ifOutdated_updateIt(ticker)),
        tap(this.Logger_GetPriceByTicker(ticker, id)),
        last);

    private readCache = curry(async (ticker: string, stack: CachedPriceI[]) =>
        stack.push(await this.dbRepo.countingGetCcPrice(ticker)));

    private ifNoCache_setNew = curry(async (ticker: string, stack: CachedPriceI[]) =>
        isNil(head(stack)) && stack.push(await this.setPriceWithMarket(ticker)));
    
    private ifOutdated_updateIt = curry(async (ticker: string, stack: CachedPriceI[]) =>
        isObject(head(stack)) && not(this.isPriceUpToDate(nth(0, stack))) && stack.push(await this.updateWithMarket(ticker)));

    private Logger_GetPriceByTicker = curry((ticker: string, id: string, stack/**/) => pipe(stack,
        stack => `${head(stack) ? "1" : "0"}${nth(1, stack) ? "0" : "1"}`,
        tap(code => this.logger.verbose(`${ticker} : ${code}${id ? " "+id : ""}`))));

    private setPriceWithMarket = (ticker: string) => pipe(ticker,
        this.getPriceSetFromReq,
        this.dbRepo.setCcPrice);

    private isPriceUpToDate = async (price: CachedPriceI) =>
        (await this.dbRepo.getCcPriceStatus(price.ISO_Code)).isEqualTo(price.marketDate);

    private updateWithMarket = (ticker: string) => pipe(ticker,
        this.getPriceUpdateSetFromReq,
        this.dbRepo.updateCcPrice);

    private getPriceSetFromReq = (ticker: string) => pipe(ticker,
        this.requestPriceByTicker,
        tap(rP => rP.status_price && this.dbRepo.setCcPriceStatusWithRP(rP)),
        async (rP) => [
            ticker,
            Object.assign(rP, {
                marketDate: await this.dbRepo.getCcPriceStatus(rP.ISO_Code),
                count: 1})
        ] as CacheSet<CachedPriceI>);

    private getPriceUpdateSetFromReq = (ticker: string) => pipe(ticker,
        this.requestPriceByTicker,
        (rP) => [ ticker, pick["price"](rP) ] as CacheUpdateSet<CachedPriceI>);

    private requestPriceByISOcode = (ISO_Code: string): Promise<PSet2[]> => this.requestPriceToMarket(ISO_Code, "ISO_Code");

    private requestPriceByTicker = (ticker: string): Promise<RequestedPrice> => this.requestPriceToMarket(ticker, "ticker");

    // TODO: Refac
    private async requestPriceToMarket(value: string, key: "ISO_Code" | "ticker") {
        return (await firstValueFrom(
            this.httpService.post(`${this.MARKET_URL}manager/price`, this.addKey({ [key]: value }))
            .pipe(catchError(error => {
                if (error.response) {
                    if (error.response.data.error === "Bad Request") {
                        throw new BadRequestException(error.response.data);
                    } else {
                        throw new InternalServerErrorException(error.response.data);
                    };
                } else {
                    throw new InternalServerErrorException(error);
                };
            }))
        )).data;
    }

    // TODO: Refac
    private async requestSpDocArrToMarket(): Promise<StatusPrice[]> {
        return (await firstValueFrom(
            this.httpService.post(`${this.MARKET_URL}manager/read_status_price`, this.addKey({}))
            .pipe(catchError(error => {
                throw error; //
            }))
        )).data;
    }

    private addKey = <T>(body: T) => (body["key"] = this.TEMP_KEY, body);

    /**
     * ### [DEV] 거래소별 상태를 리턴
     * - cache : 캐시상태
     * - market : 마켓서버상태
     */
    async getMarketPriceStatus(where: "cache" | "market") {
        try {
            const spDocArr = await this.requestSpDocArrToMarket();
            if (where === "market") {
                // return spDocArr
                return spDocArr.map((spDoc) => {
                    return {
                        ISO_Code: spDoc.ISO_Code,
                        priceStatus: MarketDate.fromSpDoc(spDoc),
                        exchangeTimezoneName: spDoc.yf_exchangeTimezoneName,
                    };
                })
            } else if (where === "cache") {
                const result: {[ISO_Code: string]: MarketDateI} = {};
                await Promise.all(spDocArr.map(async (spDoc) => {
                    result[spDoc.ISO_Code] = await this.dbRepo.getCcPriceStatus(spDoc.ISO_Code);
                }));
                return result;
            };
        } catch (error) {
            throw new InternalServerErrorException(error);
        };
    }

    /**
     * ### [DEV] assets 조회
     * - cache : 캐시에서
     * - market : 마켓서버에서
     */
    async getAssets(where: "cache" | "market"): Promise<Array<string> | object> {
        if (where === "cache") {
            return this.dbRepo.getAllCcKeys();
        } else if (where === "market") {
            const result = {};
            const yf_infoArr = (await firstValueFrom(
                this.httpService.post(`${this.MARKET_URL}manager/read_asset`, this.addKey({}))
                .pipe(catchError(error => {
                    throw error;
                }))
            )).data;
            yf_infoArr.forEach(yf_info => {
                result[yf_info.symbol] = yf_info;
                delete yf_info.symbol;
            });
            return result;
        };
    }

    /**
     * ### [DEV] request ReadPriceUpdateLog To Market
     */
    async requestReadPriceUpdateLogToMarket(body: object) {
        const q = pipe(
            entries(body),
            filter(arr => head(arr) !== "key"),
            filter(arr => last(arr)),
            map(arr => `${head(arr)}=${last(arr)}`),
            reduce((acc, cur) => acc + "&" + cur)
          );
        return (await firstValueFrom(
            this.httpService.post(`${this.MARKET_URL}manager/read_price_update_log${q ? "?" + q : ""}`, this.addKey({}))
            .pipe(catchError(error => {
                throw error;
            }))
        )).data;
    }

    /**
     * ### [DEV] 차일드프로세스로 Market 서버 실행하고 이니시에이터 완료되면 resolve 반환하는 프로미스 리턴
     * - MARKET 로그는 \<MARKET\> ... \</MARKET\> 사이에 출력
     * - 에러는 그대로 출력
     * - close 이벤트시 code 와 signal 을 담은 메세지 출력
     */
    private runMarket = () => new Promise<void>((resolve, reject) => {
        const marketCp = spawn('npm', ["run", "start:prod"], {cwd: '../market/'});
        marketCp.stdout.on('data', (data) => {
            const dataArr = data.toString().split('\x1B');
            const str = dataArr[dataArr.length - 2]
            if (str !== undefined && str.slice(-16) === 'Initiator End!!!') {
                resolve();
            };
            // 출력
            dataArr.pop()
            if (dataArr.length === 0) {
                console.log("<MARKET>", data.toString(), "</MARKET>");
            } else {
                console.log("\x1B[39m<MARKET>", dataArr.join('\x1B'), "\x1B[39m</MARKET>");
            };
        });
        marketCp.on('error', (err) => {
            console.log(err);
        });
        marketCp.stderr.on('data', (data) => {
            console.log(data.toString());
        });
        marketCp.on('close', (code, signal) => {
            console.log(`MarketCp closed with code: ${code} and signal: ${signal}`);
        });
    });

}
