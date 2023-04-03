interface ExchangeUpdateSet {
    readonly config_exchange //
    readonly lastMarketDate: string
    readonly assets: Assets
}

interface Assets {
    readonly [symbol: string]: Asset
}

interface Asset {
    yf_info //
    price: number
    currency?: string
    quoteType?: string
}