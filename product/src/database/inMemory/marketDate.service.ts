import { CACHE_MANAGER, Inject, Injectable } from "@nestjs/common";
import { Cache } from 'cache-manager';
import { MarketDate } from "src/common/class/marketDate.class";
import { InMemoryService } from "./inMemory.service";
import * as F from "@fxts/core";

@Injectable()
export class MarketDateService {

    private readonly KEY_SUFFIX = this.appMemSrv.marketDate_keySuffix;

    constructor(
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
        private readonly appMemSrv: InMemoryService
    ) {}
    
    create = (sp: Sp) => F.pipe(
        this.cacheManager.set(F.head(sp) + this.KEY_SUFFIX, F.last(sp), 0),
        this.copy);

    read = (ISO_Code: ISO_Code) => F.pipe(
        this.get(ISO_Code),
        this.copy);

    private get = (ISO_Code: ISO_Code) => F.pipe(
        this.cacheManager.get(ISO_Code + this.KEY_SUFFIX),
        this.passMarketDate);
    
    private passMarketDate = (v: any) => v instanceof MarketDate ? v : null;

    private copy = (v: MarketDate | null) => v && new MarketDate(v);

}