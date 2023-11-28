import { Injectable, Logger } from '@nestjs/common';
import { ChildApiService } from '../child_api/child_api.service';
import { TFulfilledYfPrice, TFulfilledYfInfo } from './type';
import { TYfInfo, TYfPrice } from '../type';
import { Exchange } from '../exchange/class/exchange';
import { Market_ExchangeService as ExchangeService } from '../exchange/exchange.service';
import { Either, eitherMap, eitherFlatMap } from 'src/common/class/either';
import * as F from '@fxts/core';

@Injectable()
export class Market_FinancialAssetService {

  private readonly logger = new Logger(Market_FinancialAssetService.name);

  constructor(
    private readonly childApiSrv: ChildApiService,
    private readonly exchangeSrv: ExchangeService
  ) {}

  public fetchYfInfos(tickerArr: string[]) {
    return F.pipe(
      tickerArr, F.toAsync,
      F.map(this.childApiSrv.fetchYfInfo.bind(this)),
      F.concurrent(this.childApiSrv.CONCURRENCY),
      F.toArray
    );
  }

  public fetchYfInfosByEitherTickerArr(eitherTickerArr: Either<any, string>[]) {
    return F.pipe(
      eitherTickerArr, F.toAsync,
      F.map(eitherFlatMap(this.childApiSrv.fetchYfInfo.bind(this))),
      F.concurrent(this.childApiSrv.CONCURRENCY),
      F.toArray
    );
  }

  public fetchFulfilledYfInfos(tickerArr: string[]) {
    return F.pipe(
      tickerArr, F.toAsync,
      F.map(this.childApiSrv.fetchYfInfo.bind(this)),
      F.map(eitherMap(this.fulfillYfInfo.bind(this))),
      F.concurrent(this.childApiSrv.CONCURRENCY),
      F.toArray
    );
  }

  public fetchFulfilledYfPrices(exchange: Exchange, tickerArr: string[]) {
    return F.pipe(
      tickerArr, F.toAsync,
      F.map(this.childApiSrv.fetchYfPrice.bind(this)),
      F.map(eitherMap(this.fulfillYfPrice.bind(this, exchange))),
      F.concurrent(this.childApiSrv.CONCURRENCY),
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
