import { CACHE_MANAGER, Inject, Injectable } from "@nestjs/common";
import { Cache } from 'cache-manager';
import { CachedPrice } from "src/common/class/cachedPrice.class";
import * as F from "@fxts/core";


@Injectable()
export class PriceRepository implements InMemoryRepositoryI<CachedPriceI> {

    constructor(
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    ) {}

    // Todo: 이미 있는 키 set 막기
    createOne = (symbol: TickerSymbol, price: CachedPriceI) => F.pipe(
        this.cacheManager.set(symbol, new CachedPrice(price)),
        this.copy);

    findOne = (symbol: TickerSymbol) => F.pipe(
        this.get(symbol),
        this.copy);

    // Todo: 존재하는 키만 set 허용하기
    updateOne = (symbol: TickerSymbol, update: Partial<CachedPriceI>) => F.pipe(
        this.get(symbol),
        this.copy,
        v => v && Object.assign(v, update),
        v => v && this.createOne(symbol, v));

    // Todo: 존재하는 키만 del 허용하기
    deleteOne = (symbol: TickerSymbol) => this.cacheManager.del(symbol);

    // 임시
    get = (symbol: TickerSymbol) => F.pipe(
        this.cacheManager.get(symbol),
        this.passCachedPrice);
    
    private passCachedPrice = (v: any) => v instanceof CachedPrice ? v as CachedPriceI : null;

    // 임시
    copy = (v: CachedPriceI | null) => v && new CachedPrice(v) as CachedPriceI;  

}