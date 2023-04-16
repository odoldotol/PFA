interface Price {
    readonly regularMarketPrice: number
    readonly regularMarketPreviousClose: number
}

interface YfPrice extends Price {
    readonly symbol: string
}

interface FulfilledPrice extends Price {
    readonly regularMarketLastClose: number
}

interface FulfilledYfPrice extends YfPrice {
    readonly regularMarketLastClose: number
}

interface YfPriceError { // 개판이구만
    readonly doc: string
    readonly ticker: string
    readonly args: any
}