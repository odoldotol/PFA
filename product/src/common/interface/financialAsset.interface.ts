import { Currency } from "./yahooFinance.interface";

export interface FinancialAssetCore {
  readonly symbol: string;
  readonly quoteType: string;
  readonly shortName: string | null;
  readonly longName: string | null;
  readonly exchange: string | null;
  readonly currency: Currency;
  readonly regularMarketLastClose: number;
}
