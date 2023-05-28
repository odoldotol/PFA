import { CACHE_MANAGER, Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Cache } from 'cache-manager';
import { CachedPrice } from "src/common/class/cachedPrice.class";
import { curry, each, gte, head, isObject, isString, last, lte, map, not, nth, pipe, tap, toArray, toAsync, zip } from "@fxts/core";
import { EnvironmentVariables } from "src/common/interface/environmentVariables.interface";
import { EnvKey } from "src/common/enum/envKey.emun";

@Injectable()
export class PriceRepository {

    private readonly logger = new Logger(PriceRepository.name);
    private readonly minThreshold = this.configService.get(EnvKey.MinThreshold_priceCache, 1, { infer: true });

    constructor(
        private readonly configService: ConfigService<EnvironmentVariables>,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
    ) {}

    // Todo: Refac - 캐시모듈 전체적으로 조악하다.
    
    createPrice = ([symbol, price]: CacheSet<CachedPriceI>, ttl?: number) => 
        this.setOne(symbol, new CachedPrice(price));

    readPriceCounting = (symbol: TickerSymbol) => pipe(symbol,
        this.readPrice,
        this.counting);

    updatePrice = async ([symbol, update]: CacheUpdateSet<CachedPriceI>) =>
        this.update(await this.readPrice(symbol), update);

    isGteMinCount = async (set: PSet) => pipe(head(set),
        this.readPrice,
        p => p && this.minThreshold <= p.count);

    private readPrice = (symbol: TickerSymbol): Promise<CachedPriceI | null> => pipe(symbol,
        this.getValue,
        this.passCachedPrice);
    
    private passCachedPrice = (v: CacheValue | undefined) => v instanceof CachedPrice ? v : null;
    
    private counting = (v: CachedPriceI | null) => v && v.counting && v.counting(); // Todo: Refac

    // Todo: Refac
    private setOne<T>(cacheSet: CacheSet<T>): Promise<T>
    private setOne<T>(key: CacheKey, value: T): Promise<T>
    private setOne<T>(key: CacheKey, value: T, ttl: number): Promise<T>
    private setOne<T>(arg: CacheKey | CacheSet<T>, value?: T, ttl?: number) {
        return Array.isArray(arg) ? 
            arg[2] === undefined ? this.cacheManager.set<T>(arg[0], arg[1]) : this.cacheManager.set<T>(arg[0], arg[1], arg[2])
            : this.cacheManager.set<T>(arg, value!, ttl!);
    }

    private getValue = (key: CacheKey): Promise<CacheValue | undefined> => this.cacheManager.get(key);

    private update = <T>(v: T, update: Partial<T>): T => v && Object.assign(v, update);

}