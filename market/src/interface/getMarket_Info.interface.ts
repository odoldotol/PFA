interface GetMarketInfo {
    readonly info: object,
    readonly fastinfo: object,
    readonly price: Price
    readonly metadata: object,
}

interface GetMarketErr { // ??
    readonly doc: string
    readonly ticker?: string
    readonly ISO_Code?: string
    readonly args?: any
}