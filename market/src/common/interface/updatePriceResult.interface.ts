type UpdatePriceSet = [string, FulfilledPrice]

interface UpdatePriceError {
    readonly error: any
    readonly ticker: string
    readonly res: any
}

type UpdatePriceResult = EitherI<YfPriceError | UpdatePriceError, UpdatePriceSet>[]

interface StandardUpdatePriceResult {
    readonly updatePriceResult: UpdatePriceResult
    readonly updateSatusPriceResult: StatusPrice | null
    readonly startTime: string
    readonly endTime: string
}