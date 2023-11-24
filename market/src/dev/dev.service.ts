import { Injectable } from '@nestjs/common';
import { Database_ExchangeService } from 'src/database/exchange/exchange.service';
import { LogPriceUpdateService } from 'src/database/log_priceUpdate/log_priceUpdate.service';
import { YfinanceInfoService } from "src/database/yf_info/yf_info.service";
import { Market_ExchangeService } from 'src/market/exchange/exchange.service';
import * as F from "@fxts/core";

@Injectable()
export class DevService {

  constructor(
    private readonly logPriceUpdateSrv: LogPriceUpdateService,
    private readonly market_exchangeSrv: Market_ExchangeService,
    private readonly database_exchangeSrv: Database_ExchangeService,
    private readonly yfinanceInfoSrv: YfinanceInfoService
  ) {}

  public getAllAssetsInfo() {
    return this.yfinanceInfoSrv.findAll();
  }

  public getAllExchange() {
    return this.database_exchangeSrv.readAll();
  }

  public getAllExchangeFromMarket() {
    return this.market_exchangeSrv.findAll().map(
      exchange => F.omit(["_events", "logger", "childApiSrv"] as any, exchange)
    );
  }

  public getUpdateLog(ISO_Code?: string, limit: number = 5) {
    return this.logPriceUpdateSrv.search(
      ISO_Code ? { key: ISO_Code } : {},
      limit
    );
  }
}
