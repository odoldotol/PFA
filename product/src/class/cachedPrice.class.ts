export class CachedPrice implements CachedPriceI {

    price: number;
    ISO_Code: ISO_Code;
    currency: Currency;
    marketDate: MarketDateI;
    count: number;

    constructor(price: CachedPriceI) {
        this.price = price.price;
        this.ISO_Code = price.ISO_Code;
        this.currency = price.currency;
        this.marketDate = price.marketDate;
        this.count = price.count;
    }

    counting = () => (this.count++, this);

}