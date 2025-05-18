import { getSpanContext } from "./getSpanContext"

export const getSpanId = (): string | undefined => getSpanContext()?.spanId;