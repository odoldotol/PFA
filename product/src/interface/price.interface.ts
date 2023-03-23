type SymbolPrice = [TickerSymbol, number]

type SymbolPriceCurrency = [...SymbolPrice, Currency]

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
    priceArrs: SymbolPrice[];
}

type Sp = [ISO_Code, MarketDateI]

type ISO_Code = string // TODO: ISO_Code 코드 정의 - "XNYS"...

type Currency = string // TODO: Currency 정의 - "USD"...

type TickerSymbol = string // TODO: TickerSymbol 정의 - "AAPL"...