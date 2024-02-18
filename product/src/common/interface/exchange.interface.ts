import { IsoTimezoneName } from "./yahooFinance.interface";

export interface ExchangeCore {
  readonly isoCode: ExchangeIsoCode
  readonly marketDate: MarketDate
  readonly isoTimezoneName: IsoTimezoneName
}

/**
 * @todo npm
 */
export type ExchangeIsoCode = string;

/**
 * YYYY-MM-DD
 * @todo npm
 */
export type MarketDate = string;