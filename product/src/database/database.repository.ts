import { Injectable, Logger } from "@nestjs/common";
import { IMCacheRepository } from "./iMCache/iMCache.repository";
import { MarketDate } from "../class/marketDate.class";
import { apply, compactObject, curry, each, filter, head, last, map, partition, peek, pipe, tap, toAsync } from "@fxts/core";

@Injectable()
export class DBRepository {

    private readonly logger = new Logger(DBRepository.name);

    constructor(
        private readonly iMCache: IMCacheRepository
    ) {}
    
    createCcPriceStatusWithRP = (rP: RequestedPrice) =>
        this.iMCache.createMarketDate([rP.status_price.ISO_Code, MarketDate.fromSpDoc(rP.status_price)]);
    createCcPrice = this.iMCache.createPrice;
    readCcStatusPrice = this.iMCache.readMarketDate;
    readCcPriceCounting = this.iMCache.readPriceCounting;
    updateCcPrice = this.iMCache.updatePrice;
    
    cacheRecovery = this.iMCache.localFileCacheRecovery;
    getAllCcKeys = this.iMCache.getAllKeys;

    regularUpdater = (initSet: SpPSetsSet | SpPSetsSet2) => pipe(initSet,
        this.setSpAndReturnPSets, toAsync,
        partition(this.iMCache.isGteMinCount), ([ updatePSets, deletePSets ]) => (
            pipe(updatePSets,
                map(this.toCachedPriceSet(head(initSet))),
                each(this.updateCcPrice)),
            pipe(deletePSets,
                each(a => this.iMCache.deleteOne(head(a))))
        )).then(() => this.logger.verbose(`${head(head(initSet))} : Regular Updated`));

    cacheHardInit = (initSet: SpPSetsSet2) => pipe(initSet,
        this.setSpAndReturnPSets,
        map(this.toCachedPriceSet(head(initSet))),
        each(this.createCcPrice));

    private setSpAndReturnPSets = (initSet: SpPSetsSet2) => pipe(initSet,
        tap(set => this.iMCache.createMarketDate(head(set))),
        last);

    private toCachedPriceSet = curry(([ ISO_Code, marketDate ]: Sp, priceSet: PSet | PSet2) =>
        [ head(priceSet), compactObject({
            price: priceSet[1],
            ISO_Code,
            currency: priceSet[2] ? priceSet[2] : undefined,
            marketDate,
            count: 0
        }) ] as CacheSet<CachedPriceI>);

}