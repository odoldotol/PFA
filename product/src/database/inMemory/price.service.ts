import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EnvironmentVariables } from "src/common/interface/environmentVariables.interface";
import { EnvKey } from "src/common/enum/envKey.emun";
import { PriceRepository } from "./appMemory/price.repository";
import * as F from "@fxts/core";

@Injectable()
export class PriceService {

    private readonly minThreshold = this.configService.get(EnvKey.MinThreshold_priceCache, 1, { infer: true });

    constructor(
        private readonly configService: ConfigService<EnvironmentVariables>,
        private readonly priceRepo: PriceRepository,
    ) {}
    
    create = ([symbol, price]: CacheSet<CachedPriceI>) => this.priceRepo.createOne(symbol, price);

    /**
     *  this calls the incr_count method of the CachedPrice
     */
    read_with_counting = (symbol: TickerSymbol) => F.pipe(
        this.priceRepo.get(symbol),
        v => v && v.incr_count ? v.incr_count() : null, // Todo: Refac
        this.priceRepo.copy);

    update = ([symbol, update]: CacheUpdateSet<CachedPriceI>) => this.priceRepo.updateOne(symbol, update);
    
    delete = (symbol: TickerSymbol) => this.priceRepo.deleteOne(symbol);

    isGteMinCount = (set: PSet) => F.pipe(
        this.priceRepo.findOne(F.head(set)),
        v => v && this.minThreshold <= v.count);
    
}
