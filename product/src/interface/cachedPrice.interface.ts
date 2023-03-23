interface CachedPriceI {
    price: number;
    ISO_Code: ISO_Code;
    currency: Currency;
    marketDate: MarketDateI;
    count: number;

    counting?(): CachedPriceI;
}