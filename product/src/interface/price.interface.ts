// ISO_Code 로 마켓 서버에서 오는
type SymbolPrice = [string, number, string]

// ticker 로 마켓서버에서 오는
interface RequestedPrice {
    price: number;
    ISOcode: string;
    currency: string;
    status_price?: StatusPrice;
}

interface CachedPrice {
    price: number;
    ISOcode: string;
    currency: string;
    marketDate: string;
    count: number;
}