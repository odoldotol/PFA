interface YfInfo extends YfPrice {
    readonly quoteType?: string
    readonly currency?: string
    readonly shortName?: string
    readonly market?: string
    readonly exchange?: string
    readonly exchangeTimezoneName: string
    readonly exchangeTimezoneShortName?: string
    readonly longName?: string

    // [key: string]: string|number|null|boolean
}

interface FulfilledYfInfo extends FulfilledYfPrice {
    readonly symbol: string
    readonly quoteType?: string
    readonly currency?: string
    readonly shortName?: string
    readonly market?: string
    readonly exchange?: string
    readonly exchangeTimezoneName: string
    readonly exchangeTimezoneShortName?: string
    readonly longName?: string

    // [key: string]: string|number|null|boolean
}

interface YfInfoError {
    readonly doc: string
    readonly ticker: string
    readonly args: any
}