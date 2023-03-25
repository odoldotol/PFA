import { isString, not } from "@fxts/core"

export class MarketDate extends String implements MarketDateI {

    constructor(arg: string | MarketDateI) {
        if (isString(arg) && not(/^\d{4}-\d{2}-\d{2}$/.test(arg))) throw new Error(`Invalid MarketDate : ${arg}`);
        else if (arg instanceof MarketDate) arg = arg.get;
        super(arg);
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