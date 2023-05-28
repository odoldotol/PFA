import { CACHE_MANAGER, Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Cache } from 'cache-manager';
import { curry, each, gte, head, isObject, isString, last, lte, map, not, nth, pipe, tap, toArray, toAsync, zip } from "@fxts/core";
import { EnvironmentVariables } from "src/common/interface/environmentVariables.interface";
import { EnvKey } from "src/common/enum/envKey.emun";

@Injectable()
export class IMCacheRepository {

    private readonly logger = new Logger(IMCacheRepository.name);
    private readonly PS = "_priceStatus";
    private readonly minThreshold = this.configService.get(EnvKey.MinThreshold_priceCache, 1, { infer: true });

    constructor(
        private readonly configService: ConfigService<EnvironmentVariables>,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
    ) {}

    // Todo: Refac - 캐시모듈 전체적으로 조악하다.
    
    private copy = <T>(v: T): T => v && Object.assign({copy: true}, v);

    private getKeyValueSet = async (key: CacheKey) => [ key, await this.getValue(key) ] as CacheSet<CacheValue>;

    private getValue = (key: CacheKey): Promise<CacheValue | undefined> => this.cacheManager.get(key);

    deleteOne = (key: CacheKey) => this.cacheManager.del(key);

    private getAllCache = async (): Promise<CacheSet<CacheValue>[]> =>
        toArray(zip(await this.getAllKeys(), await this.getAllValues()));

    private getAllValues = async (): Promise<CacheValue[]> => this.cacheManager.store.mget!(...await this.getAllKeys());

    getAllKeys = (): Promise<CacheKey[]> => this.cacheManager.store.keys!();

    private reset = () => this.cacheManager.reset();

}