import { CACHE_MANAGER, Inject, Injectable, Logger } from "@nestjs/common";
import { Cache } from 'cache-manager';
import { MarketDate } from "src/common/class/marketDate.class";
import { curry, each, gte, head, isObject, isString, last, lte, map, not, nth, pipe, tap, toArray, toAsync, zip } from "@fxts/core";

@Injectable()
export class MarketDateRepository {

    private readonly logger = new Logger(MarketDateRepository.name);
    private readonly PS = "_priceStatus";

    constructor(
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
    ) {}
    
    createMarketDate = (sp: Sp) => this.setOne(head(sp)+this.PS, last(sp), 0);

    readMarketDate = (ISO_Code: ISO_Code) => pipe(ISO_Code+this.PS,
        this.getValue,
        this.passMarketDate);
    
    private passMarketDate = (v: CacheValue | undefined) => v instanceof MarketDate ? v : null;

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

}