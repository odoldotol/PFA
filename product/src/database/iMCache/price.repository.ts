import { CACHE_MANAGER, Inject, Injectable, Logger } from "@nestjs/common";
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
        this.read(symbol),
        v => v && v.counting && v.counting()); // Todo: Refac

    update = async ([symbol, update]: CacheUpdateSet<CachedPriceI>) => F.pipe(
        this.read(symbol),
        v => v && Object.assign(v, update));

    isGteMinCount = async (set: PSet) => F.pipe(
        this.read(F.head(set)),
        v => v && this.minThreshold <= v.count);

    private read = (symbol: TickerSymbol): Promise<CachedPriceI | null> => F.pipe(
        this.cacheManager.get(symbol),
        this.passCachedPrice);
    
    private passCachedPrice = (v: any) => v instanceof CachedPrice ? v : null;

}
