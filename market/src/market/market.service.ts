import { Injectable } from "@nestjs/common";
import { Market_ExchangeService } from "./exchange/exchange.service";
import { Market_FinancialAssetService } from "./financialAsset/financialAsset.service";
import { TYfInfo, TYfPrice } from "./type";
import { TFulfilledYfInfo, TFulfilledYfPrice } from "./financialAsset/type";
import { Market_Exchange } from "./exchange/class/exchange";
import * as F from '@fxts/core';
import { eitherMap } from "src/common/class/either";
import { TExchangeCore } from "src/common/type";

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

  public async fetchFulfilledYfPrices(
    exchange: TExchangeCore,
    tickerArr: string[]
  ) {
    const yfPriceArr = await this.financialAssetSrv.fetchYfPrices(tickerArr);
    const marketExchange = this.exchangeSrv.getOne(exchange)!; //
    return F.pipe(
      yfPriceArr, F.toAsync,
      F.map(eitherMap(this.fulfillYfPrice.bind(this, marketExchange))),
      F.toArray
    );
  }

  public fulfillYfInfo(yfInfo: TYfInfo): TFulfilledYfInfo {
    const marketExchange = this.exchangeSrv.findOneByYfInfo(yfInfo);
    return {
      ...yfInfo,
      marketExchange,
      regularMarketLastClose: marketExchange?.isMarketOpen() ?
        yfInfo.regularMarketPreviousClose
        : yfInfo.regularMarketPrice
    }
  }

  private fulfillYfPrice(
    exchange: Market_Exchange,
    {
      symbol, 
      regularMarketPreviousClose,
      regularMarketPrice
    }: TYfPrice
  ): TFulfilledYfPrice {
    return {
      symbol,
      regularMarketLastClose: exchange.isMarketOpen() ?
        regularMarketPreviousClose
        : regularMarketPrice
    };
  }

}
