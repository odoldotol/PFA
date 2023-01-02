import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { catchError, firstValueFrom } from 'rxjs';
import { RegularUpdateForPriceBodyDto } from './dto/regularUpdateForPriceBody.dto';

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
     * 
     */
    async initiator() {
        try {
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
            const spDocArr = (await firstValueFrom(
                this.httpService.get(`${this.MARKET_URL}manager/status_price`)
                .pipe(catchError(error => {
                    throw error;
                }))
            )).data;
            await Promise.all(spDocArr.map(async spDoc => {
                const ISO_Code = spDoc.ISO_Code;
                const marketDate = spDoc.lastMarketDate.slice(0, 10);
                await this.cacheManager.set(ISO_Code, marketDate, 0);
                // 가격 캐싱 (이전 캐싱리스트를 가지고있다가 그것만 캐싱하도록 할까? 일단은 전체캐싱)
                const priceArrs = await this.getPriceFromMarket(ISO_Code, "ISO_Code");
                await Promise.all(priceArrs.map(async priceArr => {
                    const value = {
                        price: priceArr[1],
                        ISOcode: ISO_Code,
                        marketDate: marketDate,
                        count: 0
                    };
                    await this.cacheManager.set(`${priceArr[0]}`, value);
                }));
                /* logger */this.logger.warn(`${ISO_Code} : Price Cache Initiated`);
            }));
        } catch (error) {
            throw error;
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
                    const priceByTicker = await this.getPriceFromMarket(ticker, "ticker");
                    priceObj["price"] = priceByTicker["price"];
                    priceObj["marketDate"] = await this.cacheManager.get(priceObj["ISOcode"]);
                    /* logger */this.logger.verbose(`${ticker} : 10`);
                    return await this.cacheManager.set(ticker, priceObj);
                };
            } else { // 캐시에 없으면 마켓업데이터에 조회요청, 케싱 [logger 00]
                const priceByTicker = await this.getPriceFromMarket(ticker, "ticker");
                priceByTicker["marketDate"] = await this.cacheManager.get(priceByTicker["ISOcode"]);
                priceByTicker["count"] = 1;
                // set 직전에 캐시에서 가격조회 다시 해야할것같다(그 사이 생성됬을수도 있으니) // 쓸모없는 고민일까?
                const priceObjFC = await this.cacheManager.get(ticker);
                if (priceObjFC) {
                    // count + 1
                    priceObjFC["count"]++;
                    return await this.cacheManager.set(ticker, priceObjFC);
                } else {
                    /* logger */this.logger.verbose(`${ticker} : 00`);
                    return await this.cacheManager.set(ticker, priceByTicker);
                };
            };
        } catch (error) {
            throw error;
        };
    }

    /**
     * ### Market 서버에 가격조회 요청하기
     */
    async getPriceFromMarket(query_value: string, query_name: "ISO_Code" | "ticker") {
        try {
            return (await firstValueFrom(
                this.httpService.get(`${this.MARKET_URL}manager/price?${query_name}=${query_value}`)
                .pipe(catchError(error => {
                    throw error;
                }))
            )).data;
        } catch (error) {
            throw error;
        };
    }

    /**
     * ###
     * ISO_Code marketDate 수정
     * price 조회하면서 카운트 기준 미만은 캐시에서 삭제하고 기준이상은 price, marketDate 업뎃
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
                        await this.cacheManager.set(priceArr[0], priceObj);
                    };
                };
            }));
        } catch (error) {
            throw error;
        };
    }

}