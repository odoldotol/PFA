import { BadRequestException, Injectable, InternalServerErrorException, Logger, OnModuleInit } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom } from 'rxjs';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { DBRepository } from '../database/database.repository';
import * as pm2 from 'pm2';
import { concurrent, curry, delay, each, entries, filter, map, peek, pipe, reduce, reject, tap, toArray, toAsync } from '@fxts/core';

@Injectable()
export class MarketService implements OnModuleInit {

    private readonly logger = new Logger(MarketService.name);
    private readonly MARKET_URL = this.configService.get('MARKET_URL');
    private readonly TEMP_KEY: string = this.configService.get('TEMP_KEY');
    private readonly priceCacheCount: number = this.configService.get('PRICE_CACHE_COUNT');
    private readonly PM2_NAME: string = this.configService.get('PM2_NAME');
    private readonly PM2_listen_timeout: number = this.configService.get('listen_timeout');

    constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
        private readonly dbRepo: DBRepository,
    ) {}

    async onModuleInit() {
        this.logger.warn("Initiator Run!!!");
        let restoreCache: () => Promise<void>;
        if (this.PM2_NAME) {
            new Promise<boolean>((resolve, reject) => {
                pm2.connect(err => {
                    err && reject(err);
                    pm2.launchBus((err, pm2_bus) => {
                        err && reject(err);
                        pm2_bus.on('process:msg', packet => {
                            let pm2_id: number;
                            pm2.list(async (err, list) => {
                                err && reject(err);
                                try {
                                    pm2_id = list.find(p => p.pid === process.pid).pm_id;
                                } catch (e) { // old process 되고나서 재 수신시 undefined
                                    pm2_id = undefined;
                                };
                                if (
                                    packet.raw === 'cache_backup_end' &&
                                    packet.process.name === this.PM2_NAME &&
                                    packet.process.pm_id === `_old_${pm2_id}`
                                ) {
                                    resolve(true);
                                };
                            });
                        });
                        this.logger.warn("Cache Recovery listener opened");
                    });
                });
                // PM2_listen_timeout ms + 마진(3s) 이후에 연결 종료
                delay(this.PM2_listen_timeout + 3000).then(() => resolve(false));
                pm2.disconnect();
            }).then(res => (
                this.logger.warn("Cache Recovery listener closed"),
                res && restoreCache())
            ).catch(e => (pm2.disconnect(), this.logger.error(e)));
        };
        await (restoreCache = () => this.dbRepo.cacheRecovery().then(this.selectiveCacheUpdate))();
        this.logger.warn("Initiator End!!!");
    }

    private selectiveCacheUpdate = () => pipe(
        this.getSpAsyncIter(),
        reject(this.isSpLatest),
        each(this.regularUpdaterForSp)
    ).catch(e => (this.logger.error(e), this.logger.error(`SelectiveUpdate Failed`), this.cacheHardInit()));

    private cacheHardInit = () => pipe(
        this.getSpAsyncIter(),
        peek(this.setSpToCache),
        each(this.initiatePriceCache)
    ).catch(error => (this.logger.error(error), this.logger.warn(`CacheHardInit Failed`)));

    private getSpAsyncIter = async () => toAsync(map(spDoc => ({
        ISO_Code: spDoc.ISO_Code,
        marketDate: this.makeMarketDate(spDoc)
    }), await this.requestSpDocArrToMarket()));

    private isSpLatest = async (sp: Sp) => sp.marketDate === await this.dbRepo.getPriceStatus(sp.ISO_Code);

    private regularUpdaterForSp = async (sp: Sp) => this.regularUpdaterForPrice(sp.ISO_Code, sp.marketDate, await this.requestPriceByISOcode(sp.ISO_Code));

    private setSpToCache = (sp: Sp) => this.dbRepo.setPriceStatus(sp.ISO_Code, sp.marketDate);

    private initiatePriceCache = ({ ISO_Code, marketDate }: Sp) => pipe(
        this.requestPriceByISOcode(ISO_Code),
        each(price => this.dbRepo.setPrice(price[0], {
            price: price[1],
            ISO_Code,
            currency: price[2],
            marketDate,
            count: 0
        }))
    ).then(() => this.logger.verbose(`${ISO_Code} : Price Cache Initiated`))

    /**
     * ### 가격 조회
     * 캐시에서 조회
     * - 있으면 marketDate 일치 확인
     *      - 일치하면 조회 [logger 11]
     *      - 불일치하면 마켓업데이터에 조회요청, 캐시업뎃 [logger 10]
     * - 없으면 마켓업데이터에 조회요청, 케싱 [logger 00]
     */
    async getPriceByTicker(ticker: string, id?: string) {
        const cachedPrice = await this.dbRepo.countingPrice(ticker);
        if (cachedPrice) { // 캐시에 있으면 마켓업데이트 일치 확인
            const marketDate = await this.dbRepo.getPriceStatus(cachedPrice.ISO_Code);
            if (marketDate === cachedPrice.marketDate) { // marketDate 일치하면 조회
                this.logger.verbose(`${ticker} : 11${id ? " "+id : ""}`);
                return cachedPrice;
            } else { // marketDate 불일치하면 마켓업데이터에 조회요청, 캐시업뎃 [logger 10]
                const priceByTicker = await this.requestPriceByTicker(ticker);
                this.logger.verbose(`${ticker} : 10${id ? " "+id : ""}`);
                return this.dbRepo.setPrice(ticker, {...priceByTicker, marketDate, count: cachedPrice.count});
            };
        } else { // 캐시에 없으면 마켓서버에 가격요청, 케싱 [logger 00]
            const priceByTicker = await this.requestPriceByTicker(ticker);
            if (priceByTicker.status_price) await this.dbRepo.setPriceStatus(priceByTicker.status_price.ISO_Code, this.makeMarketDate(priceByTicker.status_price));
            this.logger.verbose(`${ticker} : 00${id ? " "+id : ""}`);
            return this.dbRepo.setPrice(ticker, {
                price: priceByTicker.price,
                ISO_Code: priceByTicker.ISO_Code,
                currency: priceByTicker.currency,
                marketDate: await this.dbRepo.getPriceStatus(priceByTicker.ISO_Code),
                count: 1
            });
        };
    }

    /**
     * ###
     */
    private requestPriceByISOcode = (ISO_Code: string): Promise<SymbolPriceCurrency[]> => this.requestPriceToMarket(ISO_Code, "ISO_Code");

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
     * ### Sp 로 Cache 갱신하고 Price 업데이트
     * - ISO_Code marketDate 수정
     * - price 조회하면서 카운트 기준(priceCacheCount) 미만은 캐시에서 삭제하고 기준이상은 price, marketDate 업뎃, count = 0
     */
    async regularUpdaterForPrice (ISO_Code: string, marketDate: string, priceArrs: SymbolPrice[] | SymbolPriceCurrency[]) {
        try {
            await this.dbRepo.setPriceStatus(ISO_Code, marketDate);
            await Promise.all(priceArrs.map(async (priceArr: SymbolPrice | SymbolPriceCurrency) => {
                const priceObj = await this.dbRepo.getPrice(priceArr[0]);
                if (priceObj) {
                    if (priceObj.count < this.priceCacheCount) {
                        await this.dbRepo.deletePrice(priceArr[0]);
                    } else {
                        await this.dbRepo.setPrice(priceArr[0], {
                            price: priceArr[1],
                            ISO_Code,
                            currency: priceArr[2] ? priceArr[2] : priceObj.currency,
                            marketDate,
                            count: 0
                        });
                    };
                };
            }));
            this.logger.verbose(`${ISO_Code} : Regular Updated`);
        } catch (error) {
            throw new InternalServerErrorException(error);
        };
    };

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
                        priceStatus: this.makeMarketDate(spDoc),
                        exchangeTimezoneName: spDoc.yf_exchangeTimezoneName,
                    };
                })
            } else if (where === "cache") {
                const result: {[ISO_Code: string]: string} = {};
                await Promise.all(spDocArr.map(async (spDoc) => {
                    result[spDoc.ISO_Code] = await this.dbRepo.getPriceStatus(spDoc.ISO_Code);
                }));
                return result;
            };
        } catch (error) {
            throw new InternalServerErrorException(error);
        };
    }

    /**
     * ### makeMarketDate
     */
    makeMarketDate = (spDoc: StatusPrice) => spDoc.lastMarketDate.slice(0, 10);

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
            return this.dbRepo.getAllCachedKeys();
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

    // /**
    //  * ### request createByTickerArr to Market
    //  */
    // async requestCreateByTickerArrToMarket(tickerArr: string[]) {
    //     return (await firstValueFrom(
    //         this.httpService.post(`${this.MARKET_URL}manager/asset`, tickerArr)
    //         .pipe(catchError(error => {
    //             throw error;
    //         }))
    //     )).data;
    // }

    // /**
    //  * ### request createConfigExchange to Market
    //  */
    // async requestCreateConfigExchangeToMarket(configExchange) {
    //     return (await firstValueFrom(
    //         this.httpService.post(`${this.MARKET_URL}manager/config_exchange`, configExchange)
    //         .pipe(catchError(error => {
    //             if (error.response) {
    //                 if (error.response.data.error === "Bad Request") {
    //                     throw new BadRequestException(error.response.data);
    //                 } else {
    //                     throw new InternalServerErrorException(error.response.data);
    //                 };
    //             } else {
    //                 throw new InternalServerErrorException(error);
    //             };
    //         }))
    //     )).data;
    // }

    /**
     * ### request ReadPriceUpdateLog To Market
     */
    async requestReadPriceUpdateLogToMarket(body: object) {
        const q = pipe(
            entries(body),
            filter(arr => arr[0] !== "key"),
            filter(arr => arr[1]),
            map(arr => `${arr[0]}=${arr[1]}`),
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
