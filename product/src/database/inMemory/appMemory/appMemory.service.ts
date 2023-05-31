import { CACHE_MANAGER, Inject, Injectable } from "@nestjs/common";
import { Cache } from 'cache-manager';
import * as F from "@fxts/core";

@Injectable()
export class AppMemoryService {

    constructor(
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
    ) {}

    getAllKeys = (): Promise<CacheKey[]> => this.cacheManager.store.keys!();

    getValues = (keys: CacheKey[]): Promise<CacheValue[]> => this.cacheManager.store.mget!(...keys);

    getAllCache = async (): Promise<CacheSet<CacheValue>[]> => F.pipe(
        this.getAllKeys(),
        async allKeys => F.zip(allKeys, await this.getValues(allKeys)),
        F.toArray);

    setCache = (cacheSet: CacheSet<CacheValue | BackupCacheValue>) => this.cacheManager.set(cacheSet[0], cacheSet[1], {ttl: cacheSet[2]})

}