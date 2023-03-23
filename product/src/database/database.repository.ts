import { Injectable } from "@nestjs/common";
import { IMCacheRepository } from "./iMCache/iMCache.repository";
import { CachedPrice } from "../class/cachedPrice.class";

@Injectable()
export class DBRepository {

    constructor(
        private readonly iMCache: IMCacheRepository
    ) {}

    cacheRecovery = this.iMCache.recovery;

    getAllCcKeys = this.iMCache.getAllKeys;
    
    setCcPriceStatus = this.iMCache.setMarketDate;
    
    getCcPriceStatus = this.iMCache.getMarketDate;
    
    setCcPrice = (ticker: TickerSymbol, price: CachedPriceI) => this.iMCache.setPriceAndGetCopy(ticker, new CachedPrice(price));

    getCcPrice = this.iMCache.getPriceCopy;
    
    countingGetCcPrice = this.iMCache.countingGetPriceCopy;
    
    updateCcPrice = this.iMCache.updatePriceAndGetCopy;

    deleteCcOne = this.iMCache.deleteOne;

}