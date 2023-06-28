import { Injectable, Logger } from "@nestjs/common";
import { InMemoryService } from "./inMemory/inMemory.service";
import { MarketDateService } from "./inMemory/marketDate.service";
import { PriceService } from "./inMemory/price.service";
import { MarketDate } from "src/common/class/marketDate.class";
import { apply, compactObject, curry, each, filter, head, last, map, partition, peek, pipe, tap, toAsync } from "@fxts/core";

@Injectable()
export class DatabaseService {

    private readonly logger = new Logger(DatabaseService.name);

    constructor(
        private readonly inMemorySrv: InMemoryService,
        private readonly marketDateSrv: MarketDateService,
        private readonly priceSrv: PriceService
    ) {}
    
    createCcPriceStatusWithRP = (rP: RequestedPrice) => rP.status_price &&
        this.marketDateSrv.create([rP.status_price.ISO_Code, MarketDate.fromSpDoc(rP.status_price)]);
    createCcPrice(arg: CacheSet<CachedPriceI>) {
        return this.priceSrv.create(arg);
    }
    readCcStatusPrice = this.marketDateSrv.read;
    readCcPriceCounting(arg: TickerSymbol) {
        return this.priceSrv.read_with_counting(arg);
    }
    updateCcPrice(arg: CacheUpdateSet<CachedPriceI>) {
        return this.priceSrv.update(arg);
    }
    
    cacheRecovery = this.inMemorySrv.localFileCacheRecovery;
    getAllCcKeys = this.inMemorySrv.getAllKeys;

    public getAllMarketDateAsMap() {
        return this.marketDateSrv.getAllAsMap();
    }

    // TODO: 각 업데이트 Asset이 해당 Sp 에 속한게 맞는지 검사하고 있지 않다. 이거 문제될 가능성 있는지 찾아봐.
    updatePriceBySpPSets = (initSet: SpPSets) => pipe(initSet,
        this.setSpAndReturnPSets, toAsync,
        partition(this.priceSrv.isGteMinCount), ([ updatePSets, deletePSets ]) => (
            pipe(updatePSets,
                map(this.toCacheUpdateSet(head(initSet))),
                each(this.updateCcPrice.bind(this))),
            pipe(deletePSets,
                each(a => this.priceSrv.delete(head(a))))))
    .then(() => this.logger.verbose(`${head(head(initSet))} : Regular Updated`));

    cacheHardInit = (initSet: SpPSets) => pipe(initSet,
        this.setSpAndReturnPSets,
        map(this.toCachedPriceSet(head(initSet))),
        each(this.createCcPrice));

    private setSpAndReturnPSets = (initSet: SpPSets) => pipe(initSet,
        tap(async set => await this.marketDateSrv.update(head(set)) || this.marketDateSrv.create(head(set))),
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

        isInMemoryStore_AppMemory = this.inMemorySrv.isUseingAppMemory;

}