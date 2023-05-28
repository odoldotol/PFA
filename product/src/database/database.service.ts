import { Injectable, Logger } from "@nestjs/common";
import { IMCacheRepository } from "./iMCache/iMCache.repository";
import { BackupService } from "./iMCache/backup.service";
import { MarketDateRepository } from "./iMCache/marketDate.repository";
import { PriceRepository } from "./iMCache/price.repository";
import { MarketDate } from "../common/class/marketDate.class";
import { apply, compactObject, curry, each, filter, head, last, map, partition, peek, pipe, tap, toAsync } from "@fxts/core";

@Injectable()
export class DatabaseService {

    private readonly logger = new Logger(DatabaseService.name);

    constructor(
        private readonly iMCache: IMCacheRepository,
        private readonly cacheBackupSrv: BackupService,
        private readonly marketDateRepo: MarketDateRepository,
        private readonly priceRepo: PriceRepository
    ) {}
    
    createCcPriceStatusWithRP = (rP: RequestedPrice) => rP.status_price &&
        this.marketDateRepo.create([rP.status_price.ISO_Code, MarketDate.fromSpDoc(rP.status_price)]);
    createCcPrice = this.priceRepo.createPrice;
    readCcStatusPrice = this.marketDateRepo.read;
    readCcPriceCounting = this.priceRepo.readPriceCounting;
    updateCcPrice = this.priceRepo.updatePrice;
    
    cacheRecovery = this.cacheBackupSrv.localFileCacheRecovery;
    getAllCcKeys = this.iMCache.getAllKeys;

    // TODO: 각 업데이트 Asset이 해당 Sp 에 속한게 맞는지 검사하고 있지 않다. 이거 문제될 가능성 있는지 찾아봐.
    updatePriceBySpPSets = (initSet: SpPSets) => pipe(initSet,
        this.setSpAndReturnPSets, toAsync,
        partition(this.priceRepo.isGteMinCount), ([ updatePSets, deletePSets ]) => (
            pipe(updatePSets,
                map(this.toCacheUpdateSet(head(initSet))),
                each(this.updateCcPrice)),
            pipe(deletePSets,
                each(a => this.iMCache.deleteOne(head(a))))
        )).then(() => this.logger.verbose(`${head(head(initSet))} : Regular Updated`));

    cacheHardInit = (initSet: SpPSets) => pipe(initSet,
        this.setSpAndReturnPSets,
        map(this.toCachedPriceSet(head(initSet))),
        each(this.createCcPrice));

    private setSpAndReturnPSets = (initSet: SpPSets) => pipe(initSet,
        tap(set => this.marketDateRepo.create(head(set))),
        last);

    // Todo: Refac - toCacheUpdateSet, toCachedPriceSet 중복함수
    private toCachedPriceSet = curry(([ ISO_Code, marketDate ]: Sp, priceSet: PSet) =>
        [ head(priceSet), compactObject({
            price: priceSet[1],
            ISO_Code,
            currency: priceSet[2] ? priceSet[2] : undefined,
            marketDate,
            count: 0
        }) ] as CacheSet<CachedPriceI>);

    private toCacheUpdateSet = curry(([ ISO_Code, marketDate ]: Sp, priceSet: PSet) =>
        [ head(priceSet), compactObject({
            price: priceSet[1],
            ISO_Code,
            currency: priceSet[2] ? priceSet[2] : undefined,
            marketDate,
            count: 0
        }) ] as CacheUpdateSet<CachedPriceI>);

}