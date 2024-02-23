import { Injectable } from '@nestjs/common';
import { LogPriceUpdateService } from 'src/database/log_priceUpdate/log_priceUpdate.service';
import { Market_ExchangeService } from 'src/market/exchange/exchange.service';
import { ExchangeIsoCode } from 'src/common/interface';
import * as F from "@fxts/core";

@Injectable()
export class DevService {

  constructor(
    private readonly logPriceUpdateSrv: LogPriceUpdateService,
    private readonly market_exchangeSrv: Market_ExchangeService,
  ) {}

  public getAllExchangesFromMarket() {
    return this.market_exchangeSrv.getAll().map(
      exchange => F.omit([
        "_events",
        "logger",
        // "config",
        "session"
      ] as any, exchange)
    );
  }

  public getUpdateLog(ISO_Code?: ExchangeIsoCode, limit: number = 5) {
    return this.logPriceUpdateSrv.search(
      ISO_Code ? { key: ISO_Code } : {},
      limit
    );
  }
}
