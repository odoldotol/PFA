import { CACHE_MANAGER, Inject, Injectable } from "@nestjs/common";
import { Cache } from 'cache-manager';

@Injectable()
export class IMCacheRepository {

    constructor(
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
    ) {}

    deleteOne = (key: CacheKey) => this.cacheManager.del(key);

    getAllKeys = (): Promise<CacheKey[]> => this.cacheManager.store.keys!();

}