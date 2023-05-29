import { CACHE_MANAGER, Inject, Injectable } from "@nestjs/common";
import { Cache } from 'cache-manager';
import { MarketDate } from "src/common/class/marketDate.class";
import { IMCacheRepository } from "./iMCache.repository";
import * as F from "@fxts/core";

@Injectable()
export class MarketDateRepository {

    private readonly KEY_SUFFIX = this.iMCacheRepo.marketDate_keySuffix;

    constructor(
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
        private readonly iMCacheRepo: IMCacheRepository
    ) {}
    
    create = (sp: Sp) => this.cacheManager.set(F.head(sp) + this.KEY_SUFFIX, F.last(sp), 0);

    read = (ISO_Code: ISO_Code) => F.pipe(
        this.cacheManager.get(ISO_Code + this.KEY_SUFFIX),
        this.passMarketDate,
        this.copy);
    
    private passMarketDate = (v: any) => v instanceof MarketDate ? v : null;

    private copy = (v: MarketDate | null) => v && new MarketDate(v);

}