import { Ticker } from "src/common/interface";

export type ModelResponse = {
  body: ModelResponseTicker[] | null;
  exceptionCode: ModelResponseExceptionCode | null;
};

type ModelResponseTicker = {
  ticker: Ticker;
  confidence: number; //
};

type ModelResponseExceptionCode = 40 | 41;