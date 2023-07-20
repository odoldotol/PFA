import { ExchangeDocument } from "src/database/mongodb/schema/exchange_temp.schema";
import { Either } from "../class/either"

export type UpdatePriceResult = Either<YfPriceError | UpdatePriceError, UpdatePriceSet>[];

export type StandardUpdatePriceResult = Readonly<{
    updatePriceResult: UpdatePriceResult
    updateSatusPriceResult: StatusPrice | null | ExchangeDocument // exchagne 리팩터링 후 문제
    startTime: string
    endTime: string
}>;