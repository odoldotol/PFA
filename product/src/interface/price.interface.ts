type SymbolPrice = [string, number]

// ISO_Code 로 마켓 서버에서 오는
type SymbolPriceCurrency = [...SymbolPrice, string]

// ticker 로 마켓서버에서 오는
interface RequestedPrice {
    price: number;
    ISO_Code: string;
    currency: string;
    status_price?: StatusPrice;
}

interface CachedPrice {
    readonly price: number;
    readonly ISO_Code: string;
    readonly currency: string;
    readonly marketDate: MarketDate;
    count: number;
}

interface RegularUpdatePrice {
    marketDate: MarketDate;
    priceArrs: SymbolPrice[];
}

interface Sp {
    ISO_Code: string;
    marketDate: MarketDate;
}

type MarketDate = string