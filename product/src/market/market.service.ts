import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom } from 'rxjs';
import { RegularUpdateForPriceBodyDto } from './dto/regularUpdateForPriceBody.dto';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { DBRepository } from '../database/database.repository';
import { concurrent, each, entries, filter, map, peek, pipe, reduce, tap, toArray, toAsync } from '@fxts/core';

@Injectable()
export class MarketService {

    private readonly logger = new Logger(MarketService.name);
    private readonly MARKET_URL = this.configService.get('MARKET_URL');
    private readonly priceCacheCount: number = this.configService.get('PRICE_CACHE_COUNT');

    constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
        private readonly dbRepo: DBRepository,
    ) {
        this.initiator()
        .then(() => process.send ? (process.send('ready'), this.logger.log("Send Ready to Parent Process")) : this.logger.log("Ready"))
        .catch(error => this.logger.error(error));
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

    /**
     * ###
     */
    private async initiator() {
        // await this.runMarket(); // [주의]마켓 서버를 차일드프로세스로 실행
        this.logger.warn("Initiator Run!!!");
        await this.initiateCache();

        // await this.cacheManager.del("AAPL"); // 없을경우 테스트용
        // const priceObj = await this.cacheManager.get("AAPL"); // marketDate 불일치 테스트용
        // priceObj["marketDate"] = "2022-12-28" // marketDate 불일치 테스트용
        // await this.cacheManager.set("AAPL", priceObj); // marketDate 불일치 테스트용

        this.logger.warn("Initiator End!!!");
    }

    /**
     * ### 캐시 초기화
     */
    private initiateCache = async () => pipe(
        await this.requestSpDocArrToMarket(), toAsync,
        map(async spDoc => ({ ISO_Code: spDoc.ISO_Code, marketDate: this.makeMarketDate(spDoc) })),
        peek(async ({ISO_Code, marketDate}) => await this.dbRepo.setPriceStatus(ISO_Code, marketDate)),
        // (백업된 캐시 가져오고 그것을 바탕으로 캐싱하도록 하기, 일단은 전체 캐싱)
        peek(this.initiatePriceCache),
        each(sp => this.logger.warn(`${sp.ISO_Code} : Price Cache Initiated`))
    ).catch(error => (this.logger.error(error), this.logger.warn(`Failed to initiate price cache`)));

    /**
     * ### initiatePriceCache
     */
    private initiatePriceCache = async ({ISO_Code, marketDate}) => pipe(
        await this.requestPriceByISOcode(ISO_Code), toAsync,
        map(async price => ({
            symbol: price[0],
            value: {
                price: price[1],
                ISOcode: ISO_Code,
                marketDate,
                count: 0
            }
        })),
        each(async ({symbol, value}) => await this.dbRepo.setPrice(symbol, value))
    );

    /**
     * ### 가격 조회
     * 캐시에서 조회
     * - 있으면 marketDate 일치 확인
     *      - 일치하면 조회 [logger 11]
     *      - 불일치하면 마켓업데이터에 조회요청, 캐시업뎃 [logger 10]
     * - 없으면 마켓업데이터에 조회요청, 케싱 [logger 00]
     */
    async getPriceByTicker(ticker: string, id?: string) {
        const priceObj = await this.dbRepo.getPrice(ticker);
        if (priceObj) { // 캐시에 있으면 마켓업데이트 일치 확인
            await this.dbRepo.countingPrice(ticker, priceObj);
            const marketDate = await this.dbRepo.getPriceStatus(priceObj.ISOcode);
            if (marketDate === priceObj.marketDate) { // marketDate 일치하면 조회
                this.logger.verbose(`${ticker} : 11${id ? " "+id : ""}`);
                return priceObj;
            } else { // marketDate 불일치하면 마켓업데이터에 조회요청, 캐시업뎃 [logger 10]
                const priceByTicker = await this.requestPriceByTicker(ticker);
                priceObj.price = priceByTicker.price;
                priceObj.marketDate = marketDate;
                this.logger.verbose(`${ticker} : 10${id ? " "+id : ""}`);
                return this.dbRepo.setPrice(ticker, priceObj);
            };
        } else { // 캐시에 없으면 마켓서버에 가격요청, 케싱 [logger 00]
            const priceByTicker = await this.requestPriceByTicker(ticker);
            if (priceByTicker.status_price) await this.dbRepo.setPriceStatus(priceByTicker.status_price.ISO_Code, this.makeMarketDate(priceByTicker.status_price));
            this.logger.verbose(`${ticker} : 00${id ? " "+id : ""}`);
            return this.dbRepo.setPrice(ticker, {
                price: priceByTicker.price,
                ISOcode: priceByTicker.ISOcode,
                marketDate: await this.dbRepo.getPriceStatus(priceByTicker.ISOcode),
                count: 1
            });
        };
    }

    /**
     * ###
     */
    private requestPriceByISOcode = (ISO_Code: string): Promise<SymbolPrice[]> => this.requestPriceToMarket(ISO_Code, "ISO_Code");

    /**
     * ###
     */
    private requestPriceByTicker = (ticker: string): Promise<RequestedPrice> => this.requestPriceToMarket(ticker, "ticker");

    /**
     * ### Market 서버에 가격조회 요청하기
     */
    private async requestPriceToMarket(query_value: string, query_name: "ISO_Code" | "ticker") {
        return (await firstValueFrom(
            this.httpService.get(`${this.MARKET_URL}manager/price?${query_name}=${query_value}`)
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
     * ###
     * ISO_Code marketDate 수정
     * price 조회하면서 카운트 기준(priceCacheCount) 미만은 캐시에서 삭제하고 기준이상은 price, marketDate 업뎃, count = 0
     */
    async regularUpdaterForPrice(ISO_Code: string, body: RegularUpdateForPriceBodyDto) {
        try {
            await this.dbRepo.setPriceStatus(ISO_Code, body.marketDate);
            await Promise.all(body.priceArrs.map(async priceArr => {
                const priceObj = await this.dbRepo.getPrice(priceArr[0]);
                if (priceObj) {
                    if (priceObj.count < this.priceCacheCount) {
                        await this.dbRepo.deletePrice(priceArr[0]);
                    } else {
                        priceObj.price = priceArr[1];
                        priceObj.marketDate = body.marketDate;
                        priceObj.count = 0;
                        await this.dbRepo.setPrice(priceArr[0], priceObj);
                    };
                };
            }));
            this.logger.verbose(`${ISO_Code} : Regular Updated`);
        } catch (error) {
            throw new InternalServerErrorException(error);
        };
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
            this.httpService.get(`${this.MARKET_URL}manager/status_price`)
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
                this.httpService.get(`${this.MARKET_URL}manager/asset`)
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
     * ### request createByTickerArr to Market
     */
    async requestCreateByTickerArrToMarket(tickerArr: string[]) {
        return (await firstValueFrom(
            this.httpService.post(`${this.MARKET_URL}manager/asset`, tickerArr)
            .pipe(catchError(error => {
                throw error;
            }))
        )).data;
    }

    /**
     * ### request createConfigExchange to Market
     */
    async requestCreateConfigExchangeToMarket(configExchange) {
        return (await firstValueFrom(
            this.httpService.post(`${this.MARKET_URL}manager/config_exchange`, configExchange)
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
     * ### request ReadPriceUpdateLog To Market
     */
    async requestReadPriceUpdateLogToMarket(body: object) {
        const q = pipe(
            entries(body),
            filter(arr => arr[0] !== "key"),
            map(arr => `${arr[0]}=${arr[1]}`),
            reduce((acc, cur) => acc + "&" + cur)
          );
        return (await firstValueFrom(
            this.httpService.get(`${this.MARKET_URL}manager/price_update_log${q ? "?" + q : ""}`)
            .pipe(catchError(error => {
                throw error;
            }))
        )).data;
    }

}
