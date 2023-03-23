export class MarketDate extends String implements MarketDateI {

    constructor(s: string) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) throw new Error(`Invalid MarketDate : ${s}`);
        super(s);
    }

    static fromSpDoc(spDoc: StatusPrice): MarketDate {
        return new this(spDoc.lastMarketDate.slice(0, 10));
    }

    get get () {
        return this.valueOf();
    }

    isEqualTo = (marketDate: MarketDate | string) => 
        marketDate instanceof MarketDate ?
        this.get === marketDate.get
        : this.get === marketDate;

}