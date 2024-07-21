import {
  Currency,
  ExchangeIsoCode,
  FinancialAssetCore,
  MarketDate,
  QuoteType,
  Ticker
} from 'src/common/interface';

/**
 * constructor 정의하지 않아야함. RedisEntity decorator 활용하기
 * @todo src/database/redis/todo 문서 참고
 */
export class FinancialAssetRedisEntity
  implements FinancialAssetCore
{
  public readonly symbol: Ticker;
  public readonly quoteType: QuoteType;
  public shortName: string | null;
  public longName: string | null;
  public readonly exchange: ExchangeIsoCode | null;
  public readonly currency: Currency;
  public regularMarketLastClose: number;
  public regularMarketPreviousClose: number | null;
  public marketDate: MarketDate;

  constructor(value: FinancialAssetCore) {
    this.symbol = value.symbol;
    this.quoteType = value.quoteType;
    this.shortName = value.shortName;
    this.longName = value.longName;
    this.exchange = value.exchange;
    this.currency = value.currency;
    this.regularMarketLastClose = value.regularMarketLastClose;
    this.regularMarketPreviousClose = value.regularMarketPreviousClose;
    this.marketDate = value.marketDate;
  }
}
