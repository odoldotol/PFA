import { FinancialAssetEntity } from "src/database/financialAsset/financialAsset.entity";
import { 
  Currency,
  ExchangeIsoCode,
  FinancialAssetCore,
  MarketDate,
  QuoteType,
  Ticker
} from "../interface";

export class FinancialAsset
  implements
    FinancialAssetEntity,
    FinancialAssetCore
{
  public readonly symbol: Ticker;
  public readonly quote_type: QuoteType;
  public readonly quoteType: string;
  public readonly short_name: string | null;
  public readonly shortName: string | null;
  public readonly long_name: string | null;
  public readonly longName: string | null;
  public readonly exchange: ExchangeIsoCode | null;
  public readonly currency: Currency;
  public readonly regular_market_last_close: number;
  public readonly regularMarketLastClose: number;
  public readonly regular_market_previous_close: number | null;
  public readonly regularMarketPreviousClose: number | null;
  public readonly market_date: MarketDate;
  public readonly marketDate: MarketDate;

  constructor(
    financialAsset: FinancialAssetEntity
  ) {
    this.symbol = financialAsset.symbol;
    this.quote_type = financialAsset.quote_type;
    this.quoteType = financialAsset.quote_type;
    this.short_name = financialAsset.short_name;
    this.shortName = financialAsset.short_name;
    this.long_name = financialAsset.long_name;
    this.longName = financialAsset.long_name;
    this.exchange = financialAsset.exchange;
    this.currency = financialAsset.currency;
    this.regular_market_last_close = financialAsset.regular_market_last_close;
    this.regularMarketLastClose = financialAsset.regular_market_last_close;
    this.regular_market_previous_close = financialAsset.regular_market_previous_close;
    this.regularMarketPreviousClose = financialAsset.regular_market_previous_close;
    this.market_date = financialAsset.market_date;
    this.marketDate = financialAsset.market_date;
  }

}
