interface Price {
    readonly regularMarketPrice: number
    readonly regularMarketPreviousClose: number
}

interface YfPrice extends Price {
    readonly symbol: string
}

interface FulfilledYfPrice extends Price{
    readonly regularMarketLastClose: number
}

interface YfPriceError {
    readonly doc: string
    readonly ticker: string
    readonly args: any
}