import { ExchangeCore } from "./exchange.interface";

/**
 * ### Yahoo Finance Ticker
 * - Capital letters. AAPL, BTC-USD...
 * - National Code. 005930.KS...
 * - Index. ^TYX, ^NDX...
 */
export type Ticker = string;

/**
 * ### Yahoo Finance Quote Type
 * EQUITY, CURRENCY, CRYPTO...
 */
export type QuoteType = string;

/**
 * ### Yahoo Finance Currency
 * - USD, KRW...
 * @todo enum?
 */
export type Currency = string;

/**
 * ### Yahoo Finance Exchange Name
 * NMS...
 */
export type ExchangeName = string;

/**
 * ### Yahoo Finance Timezone
 * - America/New_York...
 */
export type IsoTimezoneName = string;

/**
 * ### Yahoo Finance Timezone
 * - EST...
 */
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
  marketExchange: ExchangeCore | null;
}>;