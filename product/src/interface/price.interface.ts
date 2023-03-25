type Sp = [ISO_Code, MarketDateI]

type PSet = [TickerSymbol, number]
type PSet2 = [TickerSymbol, number, Currency]

type SpPSetsSet = [Sp, PSet[]]
type SpPSetsSet2 = [Sp, PSet2[]]

type GPSet = [TickerSymbol, CachedPriceI[]]

interface RequestedPrice {
    price: number;
    ISO_Code: ISO_Code;
    currency: Currency;
    status_price?: StatusPrice;
}

interface RegularUpdatePrice {
    ISO_Code: ISO_Code;
    marketDate: string;
    marketDateClass: MarketDateI;
    priceArrs: PSet[];
}

type ISO_Code = string // TODO: ISO_Code 정의?
type Currency = string // TODO: Currency 정의?
type TickerSymbol = string // TODO: TickerSymbol 정의?