import { ExchangeEntity } from "src/database/exchange/exchange.entity";
import {
  ExchangeCore,
  ExchangeIsoCode,
  IsoTimezoneName,
  MarketDate
} from "../interface";

export class Exchange
  implements
    ExchangeEntity,
    ExchangeCore
{  
  public readonly isoCode: ExchangeIsoCode;
  public readonly iso_code: ExchangeIsoCode;
  public readonly isoTimezoneName: IsoTimezoneName;
  public readonly iso_timezonename: IsoTimezoneName;
  public readonly marketDate: MarketDate;
  public readonly market_date: MarketDate;

  constructor(
    exchange: ExchangeEntity
  ) {
    this.isoCode = exchange.iso_code;
    this.iso_code = exchange.iso_code;
    this.isoTimezoneName = exchange.iso_timezonename;
    this.iso_timezonename = exchange.iso_timezonename;
    this.marketDate = exchange.market_date;
    this.market_date = exchange.market_date;
  }

}
