type SymbolPrice = [string, number]

interface Price {
    price: number;
    ISOcode: string;
    status_price?: StatusPrice;
}