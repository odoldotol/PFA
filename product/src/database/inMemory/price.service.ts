import { Injectable } from "@nestjs/common";
import { InjectRepository } from "./decorator/injectRepository.decorator";
import { ConfigService } from "@nestjs/config";
import { EnvironmentVariables } from "src/common/interface/environmentVariables.interface";
import { EnvKey } from "src/common/enum/envKey.emun";
import { CachedPrice } from "src/common/class/cachedPrice.class";
import * as F from "@fxts/core";

@Injectable()
export class PriceService {

    private readonly minThreshold = this.configService.get(EnvKey.MinThreshold_priceCache, 1, { infer: true });

    constructor(
        private readonly configService: ConfigService<EnvironmentVariables>,
        // Todo1: 제너릭타입 CachedPriceI 말고 CachedPrice 쓸수 있도록 하기.
        @InjectRepository(CachedPrice.name) private readonly priceRepo: InMemoryRepositoryI<CachedPriceI>,
    ) {}
    
    create = ([symbol, price]: CacheSet<CachedPriceI>) => this.priceRepo.createOne(symbol, price);

    /**
     * ### this method calls the incr_count method of the cachedPrice
     * Todo: count 는 따로 키로 빼두고 카운팅 하는게 더 좋은 구조다.
     * Todo: findOne -> count -> updateOne
     */
    read_with_counting = (symbol: TickerSymbol) => Promise.resolve(null);

    update = ([symbol, update]: CacheUpdateSet<CachedPriceI>) => this.priceRepo.updateOne(symbol, update);
    
    delete = (symbol: TickerSymbol) => this.priceRepo.deleteOne(symbol);

    isGteMinCount = (set: PSet) => F.pipe(
        this.priceRepo.findOne(F.head(set)),
        v => v && this.minThreshold <= v.count);
    
}
