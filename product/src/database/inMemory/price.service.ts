import { CACHE_MANAGER, Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Cache } from 'cache-manager';
import { CachedPrice } from "src/common/class/cachedPrice.class";
import { EnvironmentVariables } from "src/common/interface/environmentVariables.interface";
import { EnvKey } from "src/common/enum/envKey.emun";
import * as F from "@fxts/core";

@Injectable()
export class PriceService {

    private readonly minThreshold = this.configService.get(EnvKey.MinThreshold_priceCache, 1, { infer: true });

    constructor(
        private readonly configService: ConfigService<EnvironmentVariables>,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
    ) {}

    private readonly priceRepo = {

        // Todo: 이미 있는 키 set 막기
        createOne: (symbol: TickerSymbol, price: CachedPriceI) => F.pipe(
            this.cacheManager.set(symbol, new CachedPrice(price)),
            this.copy),

        /**
         *  this calls the incr_count method of the CachedPrice
         */
        findOne: (symbol: TickerSymbol) => F.pipe(
            this.get(symbol),
            v => v && v.incr_count ? v.incr_count() : null, // Todo: Refac
            this.copy),

        // Todo: 존재하는 키만 set 허용하기
        updateOne: (symbol: TickerSymbol, update: Partial<CachedPriceI>) => F.pipe(
            this.get(symbol),
            this.copy,
            v => v && Object.assign(v, update),
            v => v && this.create([symbol, v])),

        // Todo: 존재하는 키만 del 허용하기
        deleteOne: (symbol: TickerSymbol) => this.cacheManager.del(symbol),

    }
    
    create = ([symbol, price]: CacheSet<CachedPriceI>) => this.priceRepo.createOne(symbol, price);

    read_with_counting = (symbol: TickerSymbol) => this.priceRepo.findOne(symbol);

    update = ([symbol, update]: CacheUpdateSet<CachedPriceI>) => this.priceRepo.updateOne(symbol, update);
    
    delete = (symbol: TickerSymbol) => this.cacheManager.del(symbol);

    isGteMinCount = (set: PSet) => F.pipe(
        this.priceRepo.findOne(F.head(set)),
        v => v && this.minThreshold <= v.count);

    private get = (symbol: TickerSymbol) => F.pipe(
        this.cacheManager.get(symbol),
        this.passCachedPrice);
    
    private passCachedPrice = (v: any) => v instanceof CachedPrice ? v as CachedPriceI : null;

    private copy = (v: CachedPriceI | null) => v && new CachedPrice(v) as CachedPriceI;
    
}
