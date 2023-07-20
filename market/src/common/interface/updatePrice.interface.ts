// Todo: Refac

type UpdatePriceSet = [string, FulfilledPrice]

interface UpdatePriceError {
    readonly error: any
    readonly ticker: string
    readonly res: any
}