import { BadRequestException, Injectable, InternalServerErrorException, Logger, OnApplicationBootstrap, OnModuleInit } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom } from 'rxjs';
import { spawn } from 'child_process';
import { DBRepository } from '../database/database.repository';
import { Pm2Service } from '../pm2/pm2.service';
import { compactObject, concurrent, curry, delay, each, entries, filter, head, last, map, peek, pipe, reduce, reject, tap, toArray, toAsync } from '@fxts/core';
import { MarketDate } from '../class/marketDate.class';

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

    private spDocToSp = (spDoc: StatusPrice): Sp => [ spDoc.ISO_Code, this.spDocToMarketDate(spDoc) ];

    private spDocToMarketDate = (spDoc: StatusPrice) => MarketDate.fromSpDoc(spDoc);

    private isSpLatest = async (sp: Sp) => last(sp).isEqualTo(await this.dbRepo.getCcPriceStatus(head(sp)));

    private withPriceSetArr = async (sp: Sp) => [ sp, await this.requestPriceByISOcode(head(sp)) ] as [Sp, PSet2[]];

    regularUpdater =  this.dbRepo.regularUpdater;

    /**
     * ### 가격 조회
     * 캐시에서 조회
     * - 있으면 marketDate 일치 확인
     *      - 일치하면 조회 [logger 11]
     *      - 불일치하면 마켓업데이터에 조회요청, 캐시업뎃 [logger 10]
     * - 없으면 마켓업데이터에 조회요청, 케싱 [logger 00]
     */
    async getPriceByTicker(ticker: string, id?: string) {
        const cachedPrice = await this.dbRepo.countingGetCcPrice(ticker);
        if (cachedPrice) { // 캐시에 있으면 마켓업데이트 일치 확인
            const marketDate = await this.dbRepo.getCcPriceStatus(cachedPrice.ISO_Code);
            if (marketDate.isEqualTo(cachedPrice.marketDate)) { // marketDate 일치하면 조회
                this.logger.verbose(`${ticker} : 11${id ? " "+id : ""}`);
                return cachedPrice;
            } else { // marketDate 불일치하면 마켓업데이터에 조회요청, 캐시업뎃 [logger 10]
                const priceByTicker = await this.requestPriceByTicker(ticker);
                this.logger.verbose(`${ticker} : 10${id ? " "+id : ""}`);
                return this.dbRepo.setCcPrice([ticker, {...priceByTicker, marketDate, count: cachedPrice.count}]);
            };
        } else { // 캐시에 없으면 마켓서버에 가격요청, 케싱 [logger 00]
            const priceByTicker = await this.requestPriceByTicker(ticker);
            if (priceByTicker.status_price) await this.dbRepo.setCcPriceStatus([priceByTicker.status_price.ISO_Code, this.spDocToMarketDate(priceByTicker.status_price)]);
            this.logger.verbose(`${ticker} : 00${id ? " "+id : ""}`);
            return this.dbRepo.setCcPrice([ticker, {
                price: priceByTicker.price,
                ISO_Code: priceByTicker.ISO_Code,
                currency: priceByTicker.currency,
                marketDate: await this.dbRepo.getCcPriceStatus(priceByTicker.ISO_Code),
                count: 1
            }]);
        };
    }

    /**
     * ###
     */
    private requestPriceByISOcode = (ISO_Code: string): Promise<PSet2[]> => this.requestPriceToMarket(ISO_Code, "ISO_Code");

    /**
     * ###
     */
    private requestPriceByTicker = (ticker: string): Promise<RequestedPrice> => this.requestPriceToMarket(ticker, "ticker");

    /**
     * ### Market 서버에 가격조회 요청하기
     */
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

    /**
     * ### 거래소별 상태를 리턴
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
                        priceStatus: this.spDocToMarketDate(spDoc),
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
     * ### request spDocArr to Market
     */
    private async requestSpDocArrToMarket(): Promise<StatusPrice[]> {
        return (await firstValueFrom(
            this.httpService.post(`${this.MARKET_URL}manager/read_status_price`, this.addKey({}))
            .pipe(catchError(error => {
                throw error; //
            }))
        )).data;
    }

    /**
     * ### assets 조회
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
     * ### addKey
     */
    addKey = <T>(body: T) => (body["key"] = this.TEMP_KEY, body);

    /**
     * ### request ReadPriceUpdateLog To Market
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
     * ### 차일드프로세스로 Market 서버 실행하고 이니시에이터 완료되면 resolve 반환하는 프로미스 리턴
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
