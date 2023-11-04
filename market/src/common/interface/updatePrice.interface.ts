// Todo: Refac

type UpdatePriceSet = Readonly<[string, FulfilledPrice]>

interface UpdatePriceError {
    readonly error: any
    readonly ticker: string
    readonly res: any
}