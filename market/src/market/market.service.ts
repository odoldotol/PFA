import { Injectable } from "@nestjs/common";
import { Market_ExchangeService } from "./exchange/exchange.service";
import { Market_FinancialAssetService } from "./financialAsset/financialAsset.service";
import { TYfInfo, TYfPrice } from "./type";
import { TFulfilledYfInfo, TFulfilledYfPrice } from "./financialAsset/type";
import { Exchange } from "./exchange/class/exchange";
import * as F from '@fxts/core';
import { eitherMap } from "src/common/class/either";

@Injectable()
export class MarketService {
  constructor(
    private readonly exchangeSrv: Market_ExchangeService,
    private readonly financialAssetSrv: Market_FinancialAssetService
  ) {}

  public fetchFulfilledYfInfos(tickerArr: string[]) {
    const yfInfoArr = this.financialAssetSrv.fetchYfInfos(tickerArr);
    return F.pipe(
      yfInfoArr, F.toAsync,
      F.map(eitherMap(this.fulfillYfInfo.bind(this))),
      F.toArray
    );
  }

  public async fetchFulfilledYfPrices(exchange: Exchange, tickerArr: string[]) {
    const yfPriceArr = await this.financialAssetSrv.fetchYfPrices(tickerArr);
    return F.pipe(
      yfPriceArr, F.toAsync,
      F.map(eitherMap(this.fulfillYfPrice.bind(this, exchange))),
      F.toArray
    );
  }

  public fulfillYfInfo(yfInfo: TYfInfo): TFulfilledYfInfo {
    const marketExchange = this.exchangeSrv.findExchange(yfInfo.exchangeTimezoneName);
    return {
      ...yfInfo,
      marketExchange,
      regularMarketLastClose: marketExchange?.isMarketOpen()
        ? yfInfo.regularMarketPreviousClose
        : yfInfo.regularMarketPrice
    }
  }

  private fulfillYfPrice(
    exchange: Exchange,
    {
      symbol, 
      regularMarketPreviousClose,
      regularMarketPrice
    }: TYfPrice
  ): TFulfilledYfPrice {
    return {
      symbol,
      regularMarketLastClose: exchange.isMarketOpen() ? regularMarketPreviousClose : regularMarketPrice
    };
  }

}
