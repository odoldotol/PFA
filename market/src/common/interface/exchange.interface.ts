import { CONFIG_EXCHANGES2 } from "src/config/const/exchange.const";
import { IsoTimezoneName } from "./";

export type ExchangeIsoCode = keyof typeof CONFIG_EXCHANGES2;

/**
 * YYYY-MM-DD
 */
export type MarketDate = string;

export interface ExchangeIso {
  readonly isoCode: ExchangeIsoCode;
  readonly isoTimezoneName: IsoTimezoneName;
}

export interface CoreExchange
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