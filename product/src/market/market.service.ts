import { BadRequestException, CACHE_MANAGER, Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { catchError, firstValueFrom } from 'rxjs';
import { RegularUpdateForPriceBodyDto } from './dto/regularUpdateForPriceBody.dto';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';

@Injectable()
export class MarketService {

    private readonly logger = new Logger(MarketService.name);
    private readonly MARKET_URL = this.configService.get('MARKET_URL');
    private readonly priceCacheCount = 1; //

    constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) {
        this.initiator();
    }

    /**
     * ### 차일드프로세스로 Market 서버 실행하고 이니시에이터 완료되면 resolve 반환하는 프로미스 리턴
     * - MARKET 로그는 \<MARKET\> ... \</MARKET\> 사이에 출력
     * - 에러는 그대로 출력
     * - close 이벤트시 code 와 signal 을 담은 메세지 출력
     */
    async runMarket() {
        try {
            return new Promise<void>((resolve, reject) => {
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
        } catch (error) {
            throw error;
        }
    }

    /**
     * 
     */
    async initiator() {
        try {
            // await this.runMarket(); // 마켓 서버를 차일드프로세스로 실행
            /* logger */this.logger.warn("Initiator Run!!!");
            await this.cacheManager.reset();
            await this.initiatePriceCache();

            // await this.cacheManager.del("AAPL"); // 없을경우 테스트용
            // const priceObj = await this.cacheManager.get("AAPL"); // marketDate 불일치 테스트용
            // priceObj["marketDate"] = "2022-12-28" // marketDate 불일치 테스트용
            // await this.cacheManager.set("AAPL", priceObj); // marketDate 불일치 테스트용

            /* logger */this.logger.warn("Initiator End!!!");
        } catch (error) {
            throw error;
        }
    }

    /**
     * ### 가격 캐시 초기화
     */
    async initiatePriceCache() {
        try {
            // status_price 캐싱
            const spDocArr = await this.requestSpDocArrToMarket();
            await Promise.all(spDocArr.map(async spDoc => {
                const ISO_Code = spDoc.ISO_Code;
                const marketDate = spDoc.lastMarketDate.slice(0, 10);
                await this.cacheManager.set(ISO_Code, marketDate, 0);
                // 가격 캐싱 (이전 캐싱리스트를 가지고있다가 그것만 캐싱하도록 할까? 일단은 전체캐싱)
                const priceArrs = await this.requestPriceToMarket(ISO_Code, "ISO_Code");
                await Promise.all(priceArrs.map(async priceArr => {
                    const value = {
                        price: priceArr[1],
                        ISOcode: ISO_Code,
                        marketDate: marketDate,
                        count: 0
                    };
                    await this.cacheManager.set(priceArr[0], value);
                }));
                /* logger */this.logger.warn(`${ISO_Code} : Price Cache Initiated`);
            }));
        } catch (error) {
            /* logger */this.logger.error(error);
            /* logger */this.logger.warn(`Failed to initiate price cache`);
        };
    }

    /**
     * ### 가격 조회
     * 캐시에서 조회
     * - 있으면 marketDate 일치 확인
     *      - 일치하면 조회 [logger 11]
     *      - 불일치하면 마켓업데이터에 조회요청, 캐시업뎃 [logger 10]
     * - 없으면 마켓업데이터에 조회요청, 케싱 [logger 00]
     */
    async getPriceByTicker(ticker: string) {
        try {
            const priceObj = await this.cacheManager.get(ticker);
            if (priceObj) { // 캐시에 있으면 마켓업데이트 일치 확인
                // count + 1
                priceObj["count"]++;
                await this.cacheManager.set(ticker, priceObj);
                const marketDate = await this.cacheManager.get(priceObj["ISOcode"]);
                if (marketDate === priceObj["marketDate"]) { // marketDate 일치하면 조회
                    /* logger */this.logger.verbose(`${ticker} : 11`);
                    return priceObj;
                } else { // marketDate 불일치하면 마켓업데이터에 조회요청, 캐시업뎃 [logger 10]
                    const priceByTicker = await this.requestPriceToMarket(ticker, "ticker");
                    priceObj["price"] = priceByTicker["price"];
                    priceObj["marketDate"] = await this.cacheManager.get(priceObj["ISOcode"]);
                    /* logger */this.logger.verbose(`${ticker} : 10`);
                    return await this.cacheManager.set(ticker, priceObj);
                };
            } else { // 캐시에 없으면 마켓업데이터에 조회요청, 케싱 [logger 00]
                const priceByTicker = await this.requestPriceToMarket(ticker, "ticker");
                if (priceByTicker.status_price) {
                    await this.cacheManager.set(priceByTicker.status_price.ISO_Code, priceByTicker.status_price.lastMarketDate.slice(0,10), 0);
                    priceByTicker.status_price = undefined;
                };
                priceByTicker["marketDate"] = await this.cacheManager.get(priceByTicker["ISOcode"]);
                priceByTicker["count"] = 1;
                // set 직전에 캐시에서 가격조회 다시 해야할것같다(그 사이 생성됬을수도 있으니) // 쓸모없는 고민일까?
                // const priceObjFC = await this.cacheManager.get(ticker);
                // if (priceObjFC) {
                //     // count + 1
                //     priceObjFC["count"]++;
                //     return await this.cacheManager.set(ticker, priceObjFC);
                // } else {
                    /* logger */this.logger.verbose(`${ticker} : 00`);
                    return await this.cacheManager.set(ticker, priceByTicker);
                // };
            };
        } catch (error) {
            throw error;
        };
    }

    /**
     * ### Market 서버에 가격조회 요청하기
     */
    async requestPriceToMarket(query_value: string, query_name: "ISO_Code" | "ticker") {
        try {
            return (await firstValueFrom(
                this.httpService.get(`${this.MARKET_URL}manager/price?${query_name}=${query_value}`)
                .pipe(catchError(error => {
                    throw error;
                }))
            )).data;
        } catch (error) {
            if (error.response) {
                if (error.response.data.error === "Bad Request") {
                    throw new BadRequestException(error.response.data);
                } else {
                    throw new InternalServerErrorException(error.response.data);
                };
            } else {
                throw new InternalServerErrorException(error);
            };
        };
    }

    /**
     * ###
     * ISO_Code marketDate 수정
     * price 조회하면서 카운트 기준 미만은 캐시에서 삭제하고 기준이상은 price, marketDate 업뎃, count = 0
     */
    async regularUpdaterForPrice(ISO_Code: string, body: RegularUpdateForPriceBodyDto) {
        try {
            await this.cacheManager.set(ISO_Code, body.marketDate, 0);
            await Promise.all(body.priceArrs.map(async priceArr => {
                const priceObj = await this.cacheManager.get(priceArr[0]);
                if (priceObj) {
                    if (priceObj["count"] < this.priceCacheCount) {
                        await this.cacheManager.del(priceArr[0]);
                    } else {
                        priceObj["price"] = priceArr[1];
                        priceObj["marketDate"] = body.marketDate;
                        priceObj["count"] = 0;
                        await this.cacheManager.set(priceArr[0], priceObj);
                    };
                };
            }));
            /* logger */this.logger.verbose(`${ISO_Code} : Regular Updated`);
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
                        priceStatus: spDoc.lastMarketDate.slice(0,10),
                        exchangeTimezoneName: spDoc.yf_exchangeTimezoneName,
                    };
                })
            } else if (where === "cache") {
                const result = {};
                await Promise.all(spDocArr.map(async (spDoc) => {
                    result[spDoc.ISO_Code] = await this.cacheManager.get(spDoc.ISO_Code);
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
    async requestSpDocArrToMarket() {
        try {
            return (await firstValueFrom(
                this.httpService.get(`${this.MARKET_URL}manager/status_price`)
                .pipe(catchError(error => {
                    throw error;
                }))
            )).data;
        } catch (error) {
            throw error;
        };
    }

    /**
     * ### assets 조회
     * - cache : 캐시에서
     * - market : 마켓서버에서
     */
    async getAssets(where: "cache" | "market") {
        try {
            if (where === "cache") {
                return await this.cacheManager.store.keys();
            } else if (where === "market") {
                const result = {};
                const yf_infoArr = (await firstValueFrom(
                    this.httpService.get(`${this.MARKET_URL}manager/yf_info`)
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
        } catch (error) {
            throw error;
        };
    }

    /**
     * ### request createByTickerArr to Market
     */
    async requestCreateByTickerArrToMarket(tickerArr: string[]) {
        try {
            return (await firstValueFrom(
                this.httpService.post(`${this.MARKET_URL}manager/yf_info`, tickerArr)
                .pipe(catchError(error => {
                    throw error;
                }))
            )).data;
        } catch (error) {
            throw error;
        };
    }

}
