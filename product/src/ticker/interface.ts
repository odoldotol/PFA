import { Ticker } from "src/common/interface";

export type ModelResponse = {
  body: ModelResponseTicker[] | null;
  exceptionCode: ModelResponseExceptionCode | undefined;
};

export type ModelResponseTicker = {
  ticker: Ticker;
  confidence: number; //
};

export type ModelResponseExceptionCode = 40 | 41;