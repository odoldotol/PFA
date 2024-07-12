import { IsoTimezoneName } from "./yahooFinance.interface";
import { ISOYmd } from "../util";
// import { Day, Digit, Month } from "../util";

/**
 * @todo npm
 */
export type ExchangeIsoCode = string;

/**
 * YYYY-MM-DD
 * - 너무 많은 타입집합은 ide 를 느리게 할 수 있음.
 * @todo npm
 */
export type MarketDate = ISOYmd | typeof MARKET_DATE_DEFAULT;
// export type MarketDate = `${MarketDateYear}-${Month}-${Day}` | typeof MARKET_DATE_DEFAULT;

export const MARKET_DATE_DEFAULT = '0000-00-00';

export interface ExchangeIso {
  readonly isoCode: ExchangeIsoCode;
  readonly isoTimezoneName: IsoTimezoneName;
}

export interface ExchangeCore
  extends ExchangeIso
{
  readonly marketDate: MarketDate;
}

// type MarketDateYear = `19${Digit}${Digit}` | `20${Digit}${Digit}`;