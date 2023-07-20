// Todo: Refac

import { Either } from "../class/either"
import { TExchangeCore } from "../type/exchange.type";

export type UpdatePriceResult = Either<YfPriceError | UpdatePriceError, UpdatePriceSet>[];

export type StandardUpdatePriceResult = Readonly<{
    updatePriceResult: UpdatePriceResult
    updateSatusPriceResult: TExchangeCore | null
    startTime: string
    endTime: string
}>;