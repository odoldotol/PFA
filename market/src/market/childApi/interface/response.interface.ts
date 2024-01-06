import {
  Currency,
  ExchangeName,
  IsoTimezoneName,
  QuoteType,
  Ticker,
  TimezoneShortName
} from "src/common/interface";

export type ChildResponseEcSession = Readonly<{
  previous_open: string;
  previous_close: string;
  next_open: string;
  next_close: string;
}>;

export type ChildResponseYfInfo = Readonly<{
  info: YfinanceInfo;
  fastinfo: YfinanceFastInfo;
  price: ChildResponseYfPrice | null;
  metadata: YfinanceMetadata;
}>;

export type ChildResponseYfPrice = Readonly<{
  regularMarketPrice: number;
  regularMarketPreviousClose: number;
}>;

// Todo
type YfinanceInfo = Readonly<{
  [key: string]: any; //
}>;

// Todo
type YfinanceMetadata = Readonly<{
  currency: Currency; // ex) "USD"
  symbol: Ticker;
  exchangeName: ExchangeName; // ex) "NMS"
  instrumentType: string; // ex) "EQUITY"
  timezone: TimezoneShortName; // ex) "EST"
  exchangeTimezoneName: IsoTimezoneName; // ex) "America/New_York"
  [key: string]: any; //
}>;

// Todo
type YfinanceFastInfo = Readonly<{
  currency: Currency; // ex) "USD"
  exchange: ExchangeName; // ex) "NMS"
  quoteType: QuoteType; // ex) "EQUITY"
  timezone: IsoTimezoneName; // ex) "America/New_York"
  [key: string]: any; //
}>;