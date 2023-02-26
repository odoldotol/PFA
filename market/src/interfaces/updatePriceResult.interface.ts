type UpdatePriceSet = [string, FulfilledPrice]

interface UpdatePriceError {
    readonly error: any
    readonly ticker: string
    readonly res: any
}

interface UpdatePriceResult {
    readonly success: UpdatePriceSet[]
    readonly failure: (UpdatePriceError|YfPriceError)[]
}

interface StandardUpdatePriceResult {
    readonly updatePriceResult: UpdatePriceResult
    readonly updateSatusPriceResult: StatusPrice
    readonly startTime: string
    readonly endTime: string
}