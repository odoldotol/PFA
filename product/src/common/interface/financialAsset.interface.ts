import {
  Currency,
  ExchangeIsoCode,
  MarketDate,
  Ticker,
  QuoteType
} from ".";

export interface FinancialAssetCore {
  readonly symbol: Ticker;
  readonly quoteType: QuoteType;
  shortName: string | null;
  longName: string | null;
  exchange: ExchangeIsoCode | null;
  readonly currency: Currency;
  regularMarketLastClose: number;
  regularMarketPreviousClose: number | null;
  marketDate: MarketDate;
}

export type PriceTuple = [
  Ticker,
  number,
  number | null
];