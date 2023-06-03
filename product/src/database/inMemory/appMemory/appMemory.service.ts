import { CACHE_MANAGER, Inject, Injectable } from "@nestjs/common";
import { Cache } from 'cache-manager';
import * as F from "@fxts/core";

@Injectable()
export class AppMemoryService implements InMemoryStoreServiceI {

    constructor(
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
    ) {}

    getAllKeys = (): Promise<CacheKey[]> => this.cacheManager.store.keys!();

    getValues = (keys: CacheKey[]): Promise<CacheValue[]> => this.cacheManager.store.mget!(...keys);

    getAllCache = async (): Promise<CacheSet<CacheValue>[]> => F.pipe(
        this.getAllKeys(),
        async allKeys => F.zip(allKeys, await this.getValues(allKeys)),
        F.toArray);

    setCache = <T>(cacheSet: CacheSet<T>) => this.cacheManager.set(cacheSet[0], cacheSet[1], {ttl: cacheSet[2]})

    /**
     * ### 사용주의 - 반환값을 신뢰하지 말것. delete 연산을 하기는 하지만, 결과는 가짜구현임.
     * - Todo: delete 성공이면 true 아니면 false 반환
     */
    deleteCache = async (key: string) => Boolean(await this.cacheManager.del(key));

    getValue = (key: string) => this.cacheManager.get(key);

}