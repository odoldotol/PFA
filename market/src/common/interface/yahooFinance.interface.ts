import { CoreExchange } from "./exchange.interface";

export type Ticker = string;
export type QuoteType = string;
export type Currency = string;
export type ExchangeName = string;
export type IsoTimezoneName = string;
export type TimezoneShortName = string;

type Yf = Readonly<{
  symbol: Ticker;
}>;

export type YfPrice
= Yf
& Readonly<{
  regularMarketPrice: number;
  regularMarketPreviousClose: number;
}>;

export type YfInfo
= YfPrice
& Readonly<{
  quoteType: QuoteType;
  currency: Currency;
  shortName?: string;
  longName?: string;
  market?: string;
  exchangeName: ExchangeName;
  exchangeTimezoneName: IsoTimezoneName;
  timezone: TimezoneShortName;
  [key: string]: any;
}>;

export type FulfilledYfPrice
= Yf
& Readonly<{
  regularMarketLastClose: number;
}>;

export type FulfilledYfInfo
= YfInfo
& FulfilledYfPrice
& Readonly<{
  marketExchange: CoreExchange | null;
}>;