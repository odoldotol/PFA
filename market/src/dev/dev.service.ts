import { Injectable } from '@nestjs/common';
import { ExchangeService as DbExchangeService } from 'src/database/exchange/exchange.service';
import { Log_priceUpdateService as DbLog_priceUpdateService } from 'src/database/log_priceUpdate/log_priceUpdate.service';
import { Yf_infoService as DbYfInfoService } from "src/database/yf_info/yf_info.service";
import { ExchangeService as MkExchangeService } from 'src/market/exchange/exchange.service';
import * as F from "@fxts/core";

@Injectable()
export class DevService {

  constructor(
    private readonly dbLogPriceUpdate: DbLog_priceUpdateService,
    private readonly mkExchangeSrv: MkExchangeService,
    private readonly dbExchangeSrv: DbExchangeService,
    private readonly dbYfInfoSrv: DbYfInfoService
  ) {}

  public getAllAssetsInfo() {
    return this.dbYfInfoSrv.findAll();
  }

  public getAllExchange() {
    return this.dbExchangeSrv.readAll();
  }

  public getAllExchangeFromMarket() {
    return this.mkExchangeSrv.findAll().map(
      exchange => F.omit(["_events", "logger", "childApiSrv"] as any, exchange)
    );
  }

  public getUpdateLog(ISO_Code?: string, limit: number = 5) {
    return this.dbLogPriceUpdate.find1(
      ISO_Code ? { key: ISO_Code } : {},
      limit
    );
  }
}
