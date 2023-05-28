import { CACHE_MANAGER, Inject, Injectable, Logger } from "@nestjs/common";
import { Cache } from 'cache-manager';
import { MarketDate } from "src/common/class/marketDate.class";
import * as F from "@fxts/core";

@Injectable()
export class MarketDateRepository {

    private readonly PS = "_priceStatus";

    constructor(
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
    ) {}
    
    create = (sp: Sp) => this.cacheManager.set(F.head(sp)+this.PS, F.last(sp), 0);

    read = (ISO_Code: ISO_Code) => F.pipe(
        this.cacheManager.get(ISO_Code+this.PS),
        this.passMarketDate);
    
    private passMarketDate = (v: any) => v instanceof MarketDate ? v : null;

}