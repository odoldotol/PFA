import { CACHE_MANAGER, Inject, Injectable } from "@nestjs/common";
import { Cache } from 'cache-manager';
import * as F from "@fxts/core";

@Injectable()
export class AppMemoryService {

    private readonly MarketDate_KEY_SUFFIX = "_priceStatus";

    constructor(
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
    ) {}

    getAllKeys = (): Promise<CacheKey[]> => this.cacheManager.store.keys!();

    getAllValues = async (): Promise<CacheValue[]> => this.cacheManager.store.mget!(...await this.getAllKeys());

    getAllCache = async (): Promise<CacheSet<CacheValue>[]> =>
        F.toArray(F.zip(await this.getAllKeys(), await this.getAllValues()));

    get marketDate_keySuffix() { return this.MarketDate_KEY_SUFFIX };

    setCache = (cacheSet: CacheSet<CacheValue | BackupCacheValue>) => this.cacheManager.set(cacheSet[0], cacheSet[1], {ttl: cacheSet[2]})

}