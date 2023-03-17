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
    price: number;
    ISO_Code: string;
    currency: string;
    marketDate: string;
    count: number;
}

interface RegularUpdatePrice {
    marketDate: string;
    priceArrs: SymbolPrice[];
}