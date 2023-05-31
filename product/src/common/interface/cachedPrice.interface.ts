interface CachedPriceI {
    readonly price: number;
    readonly ISO_Code: ISO_Code;
    readonly currency: Currency;
    readonly marketDate: MarketDateI;
    readonly count: number;

    incr_count?(): CachedPriceI;
}