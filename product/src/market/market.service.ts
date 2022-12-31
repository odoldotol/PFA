import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class MarketService {

    private readonly logger = new Logger(MarketService.name);
    private readonly MARKET_URL = this.configService.get('MARKET_URL');

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
                const priceArrs = (await firstValueFrom(
                    this.httpService.get(`${this.MARKET_URL}manager/price?ISO_Code=${ISO_Code}`)
                    .pipe(catchError(error => {
                        throw error;
                    }))
                )).data;
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

}
