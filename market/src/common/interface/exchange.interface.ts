import { CONFIG_EXCHANGES2 } from "src/config/const/exchange.const";
import { IsoTimezoneName } from "./";
import { ISOYmd } from "../util";
// import { Day, Digit, Month } from "../util";

export type ExchangeIsoCode = keyof typeof CONFIG_EXCHANGES2;

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

export type ConfigExchange = Readonly<{
  market: string;
  country?: string;
  exchange_website?: string;
  ISO_TimezoneName: IsoTimezoneName;
  yahooFinance_update_margin?: number;
}>;

export type ConfigExchanges = {
  readonly [K in ExchangeIsoCode]: ConfigExchange;
};

// type MarketDateYear = `19${Digit}${Digit}` | `20${Digit}${Digit}`;