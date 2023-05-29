import { CACHE_MANAGER, Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Cache } from 'cache-manager';
import { CachedPrice } from "src/common/class/cachedPrice.class";
import { EnvironmentVariables } from "src/common/interface/environmentVariables.interface";
import { EnvKey } from "src/common/enum/envKey.emun";
import * as F from "@fxts/core";

@Injectable()
export class PriceRepository {

    private readonly minThreshold = this.configService.get(EnvKey.MinThreshold_priceCache, 1, { infer: true });

    constructor(
        private readonly configService: ConfigService<EnvironmentVariables>,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
    ) {}
    
    create = ([symbol, price]: CacheSet<CachedPriceI>) => 
        this.cacheManager.set(symbol, new CachedPrice(price));

    read_with_counting = (symbol: TickerSymbol) => F.pipe(
        this.get(symbol),
        v => v && v.counting ? v.counting() : null, // Todo: Refac
        this.copy);

    update = async ([symbol, update]: CacheUpdateSet<CachedPriceI>) => F.pipe(
        this.get(symbol),
        v => v && Object.assign(v, update),
        this.copy);

    isGteMinCount = async (set: PSet) => F.pipe(
        this.get(F.head(set)),
        v => v && this.minThreshold <= v.count);

    private get = (symbol: TickerSymbol) => F.pipe(
        this.cacheManager.get(symbol),
        this.passCachedPrice);
    
    private passCachedPrice = (v: any) => v instanceof CachedPrice ? v as CachedPriceI : null;

    private copy = (v: CachedPriceI | null) => v && new CachedPrice(v) as CachedPriceI;
    
}
