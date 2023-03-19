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
    readonly marketDate: string;
    count: number;
}

interface RegularUpdatePrice {
    marketDate: string;
    priceArrs: SymbolPrice[];
}

type SpAsyncIter = AsyncIterableIterator<{
    ISO_Code: string;
    marketDate: string;
}>