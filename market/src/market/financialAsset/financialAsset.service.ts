import { Injectable } from '@nestjs/common';
import { YfinanceApiService } from '../childApi/yfinanceApi.service';
import { Market_ExchangeService } from '../exchange/exchange.service';
import { Market_Exchange } from '../exchange/class';
import {
  ExchangeIsoCode,
  FulfilledYfInfo,
  FulfilledYfPrice,
  Ticker,
  YfInfo,
  YfPrice
} from 'src/common/interface';
import Either, * as E from 'src/common/class/either';
import * as F from '@fxts/core';

@Injectable()
export class Market_FinancialAssetService {

  constructor(
    private readonly yfinanceApiSrv: YfinanceApiService,
    private readonly exchangeSrv: Market_ExchangeService,
  ) {}

  public fetchYfInfosByEitherTickerArr(
    eitherTickerArr: readonly Either<any, Ticker>[]
  ): Promise<Either<any/* */, YfInfo>[]> {
    return F.pipe(
      eitherTickerArr, F.toAsync,
      F.map(E.flatMap(this.yfinanceApiSrv.fetchYfInfo.bind(this.yfinanceApiSrv))),
      F.toArray
    );
  }

  public async fetchFulfilledYfPrices(
    isoCode: ExchangeIsoCode,
    tickerArr: Ticker[]
  ) {
    const yfPriceArr = await this.fetchYfPrices(tickerArr);
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

  private fetchYfPrices(
    tickerArr: readonly Ticker[]
  ): Promise<Either<any/* */, YfPrice>[]> {
    return F.pipe(
      tickerArr, F.toAsync,
      F.map(this.yfinanceApiSrv.fetchYfPrice.bind(this.yfinanceApiSrv)),
      F.toArray
    );
  }

}
