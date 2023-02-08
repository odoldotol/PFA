export interface YfInfo {
    symbol: string
    quoteType: string
    currency: string
    shortName: string
    market: string
    exchange: string
    exchangeTimezoneName: string
    exchangeTimezoneShortName: string
    regularMarketPreviousClose: number
    regularMarketPrice: number
    longName?: string

    [key: string]: string|number|null|boolean
}