import { ExchangeIsoCode, MarketDate } from "./exchange.interface";
import { Currency, QuoteType, Ticker } from "./yahooFinance.interface";

export interface FinancialAssetCore {
  readonly symbol: Ticker;
  readonly quoteType: QuoteType;
  readonly shortName: string | null;
  readonly longName: string | null;
  readonly exchange: ExchangeIsoCode | null;
  readonly currency: Currency;
  readonly regularMarketLastClose: number;
  readonly regularMarketPreviousClose: number | null;
  readonly marketDate: MarketDate;
}
