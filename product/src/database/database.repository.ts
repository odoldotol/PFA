import { Injectable, Logger } from "@nestjs/common";
import { IMCacheRepository } from "./iMCache/iMCache.repository";
import { apply, compactObject, curry, each, filter, head, last, map, partition, peek, pipe, tap, toAsync } from "@fxts/core";

@Injectable()
export class DBRepository {

    private readonly logger = new Logger(DBRepository.name);

    constructor(
        private readonly iMCache: IMCacheRepository
    ) {}

    cacheRecovery = this.iMCache.localFileCacheRecovery;

    getAllCcKeys = this.iMCache.getAllKeys;
    
    setCcPriceStatus = this.iMCache.setMarketDate
    
    getCcPriceStatus = this.iMCache.getMarketDate;
    
    setCcPrice = this.iMCache.setPriceAndGetCopy;

    getCcPrice = this.iMCache.getPriceCopy;
    
    countingGetCcPrice = this.iMCache.countingGetPriceCopy;
    
    updateCcPrice = this.iMCache.updatePriceAndGetCopy;

    deleteCcOne = this.iMCache.deleteOne;

    regularUpdater = async (initSet: SpPSetsSet | SpPSetsSet2) => pipe(initSet,
        this.setSpAndReturnPSets, toAsync,
        partition(this.iMCache.isGteMinCount), ([truePSets, falsePSets]) => (
            pipe(truePSets,
                map(this.toCachedPriceSet(head(initSet))),
                each(this.updateCcPrice)),
            pipe(falsePSets,
                each(a => this.deleteCcOne(head(a))))
        )).then(() => this.logger.verbose(`${head(head(initSet))} : Regular Updated`));

    cacheHardInit = (initSet: SpPSetsSet2) => pipe(initSet,
        this.setSpAndReturnPSets,
        map(this.toCachedPriceSet(head(initSet))),
        each(this.setCcPrice));

    private setSpAndReturnPSets = (initSet: SpPSetsSet2) => pipe(initSet,
        tap(set => this.setCcPriceStatus(head(set))),
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