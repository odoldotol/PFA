import { MarketDate } from "./marketDate.class";

export class CachedPrice implements CachedPriceI {

    readonly price: number;
    readonly ISO_Code: ISO_Code;
    readonly currency: Currency;
    readonly marketDate: MarketDate;
    readonly count: number;

    constructor(price: CachedPriceI) {
        this.price = price.price;
        this.ISO_Code = price.ISO_Code;
        this.currency = price.currency;
        this.marketDate = new MarketDate(price.marketDate);
        this.count = price.count;
    }

    // @ts-ignore
    counting() {this.count++; return this;}

}