import { CACHE_MANAGER, Inject, Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { Cache } from 'cache-manager';
import { curry, each, map, pipe, toArray, toAsync } from "@fxts/core";

@Injectable()
export class DBRepository implements OnModuleDestroy {

    private readonly logger = new Logger(DBRepository.name);
    private readonly PS = "_priceStatus";

    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) {}

    /**
     * ### 앱 종료시 캐시 백업
     */
    async onModuleDestroy(signal?: string) {
        this.logger.warn(`Cache Backup Start`);
        const keyArr = await this.cacheManager.store.keys();
        const BackupObj = {};
        const cacheArr = await Promise.all(keyArr.map(async (key) => {
            const cache = await this.cacheManager.get(key);
            BackupObj[key] = cache['count'];
        }));
        // 대충 이렇게 구현하면 되겠다~
        // [TODO] 완성시키기 (임시로 5초간 sleep)
        await new Promise((resolve) => setTimeout(resolve, 5000));
        this.logger.warn(`Cache Backup End`);
    }

    /**
     * ### setPriceStatus
     */
    setPriceStatus = (ISO_Code: string, marketDate: string) => this.cacheManager.set(ISO_Code+this.PS, marketDate, 0);

    /**
     * ### getPriceStatus
     */
    getPriceStatus = (ISO_Code: string): Promise<string> => this.cacheManager.get(ISO_Code+this.PS);

    /**
     * ### setPrice
     */
    setPrice = (symbol: string, price: CachedPrice) => this.cacheManager.set(symbol, price);

    /**
     * ### getPrice
     */
    getPrice = (symbol: string): Promise<CachedPrice> => this.cacheManager.get(symbol);

    /**
     * ### countingPrice
     * - count 1 증가
     */
    countingPrice = (symbol: string, price: CachedPrice) => (price.count++, this.setPrice(symbol, price));

    /**
     * ### deletePrice
     */
    deletePrice = (symbol: string) => this.cacheManager.del(symbol);

    /**
     * ###
     */
    getAllCachedKeys = () => this.cacheManager.store.keys();
}