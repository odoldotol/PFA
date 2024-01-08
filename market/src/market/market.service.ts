import { Injectable } from "@nestjs/common";
import { Market_ExchangeService } from "./exchange/exchange.service";
import {
  Market_FinancialAssetService
} from "./financialAsset/financialAsset.service";
import { Market_Exchange } from "./exchange/class/exchange";
import {
  ExchangeIsoCode,
  FulfilledYfInfo,
  FulfilledYfPrice,
  Ticker,
  YfInfo,
  YfPrice
} from "src/common/interface";
import * as E from "src/common/class/either";
import * as F from '@fxts/core';

@Injectable()
export class MarketService {
  constructor(
    private readonly exchangeSrv: Market_ExchangeService,
    private readonly financialAssetSrv: Market_FinancialAssetService
  ) {}

  public fetchFulfilledYfInfos(tickerArr: Ticker[]) {
    const yfInfoArr = this.financialAssetSrv.fetchYfInfos(tickerArr);
    return F.pipe(
      yfInfoArr, F.toAsync,
      F.map(E.map(this.fulfillYfInfo.bind(this))),
      F.toArray
    );
  }

  public async fetchFulfilledYfPrices(
    isoCode: ExchangeIsoCode,
    tickerArr: Ticker[]
  ) {
    const yfPriceArr = await this.financialAssetSrv.fetchYfPrices(tickerArr);
    const marketExchange = this.exchangeSrv.getOne(isoCode);
    return F.pipe(
      yfPriceArr, F.toAsync,
      F.map(E.map(this.fulfillYfPrice.bind(this, marketExchange))),
      F.toArray
    );
  }

  public fulfillYfInfo(yfInfo: YfInfo): FulfilledYfInfo {
    const marketExchange = this.exchangeSrv.findOneByYfInfo(yfInfo);
    return Object.assign(
      yfInfo,
      { marketExchange },
      this.fulfillYfPrice(marketExchange, yfInfo)
    );
  }

  private fulfillYfPrice(
    exchange: Market_Exchange | null,
    {
      symbol, 
      regularMarketPreviousClose,
      regularMarketPrice
    }: YfPrice
  ): FulfilledYfPrice {
    return {
      symbol,
      regularMarketLastClose: exchange?.isMarketOpen() ?
        regularMarketPreviousClose :
        regularMarketPrice
    };
  }

}
