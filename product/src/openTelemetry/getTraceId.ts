import { getSpanContext } from "./getSpanContext";

export const getTraceId = (): string | undefined => getSpanContext()?.traceId;