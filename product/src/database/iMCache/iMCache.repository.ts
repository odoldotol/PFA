import { CACHE_MANAGER, Inject, Injectable } from "@nestjs/common";
import { Cache } from 'cache-manager';

@Injectable()
export class IMCacheRepository {

    private readonly MarketDate_KEY_SUFFIX = "_priceStatus";

    constructor(
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
    ) {}

    getAllKeys = (): Promise<CacheKey[]> => this.cacheManager.store.keys!();

    get marketDate_keySuffix() { return this.MarketDate_KEY_SUFFIX };

}