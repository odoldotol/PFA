import { Either } from "../class/either"

export type UpdatePriceResult = Either<YfPriceError | UpdatePriceError, UpdatePriceSet>[];

export type StandardUpdatePriceResult = Readonly<{
    updatePriceResult: UpdatePriceResult
    updateSatusPriceResult: StatusPrice | null
    startTime: string
    endTime: string
}>;