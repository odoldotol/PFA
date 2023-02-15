type UpdatePriceResult = [string, FulfilledYfPrice]

interface UpdatePriceError {
    readonly error: any
    readonly ticker: string
    readonly result?: any
}

interface UpdatePriceResultArr {
    readonly success: UpdatePriceResult[]
    readonly failure: (UpdatePriceError|YfPriceError)[]
}

interface UpdatePriceByFilterError {
    readonly error: any
    readonly filter: object
    readonly isStandard: boolean
}

interface StandardUpdatePriceResult {
    readonly updatePriceResult: EitherI<UpdatePriceByFilterError, UpdatePriceResultArr>
    readonly updateSatusPriceResult: StatusPrice
    readonly startTime: string
    readonly endTime: string
}

interface FlattenStandardUpdatePriceResult {
    readonly updatePriceResult: UpdatePriceByFilterError|UpdatePriceResultArr
    readonly updateSatusPriceResult: StatusPrice
    readonly startTime: string
    readonly endTime: string
}

interface UpdaterForPriceResult {
    readonly updateResult: FlattenStandardUpdatePriceResult
    readonly updateLog: Error|LogPriceUpdate
};