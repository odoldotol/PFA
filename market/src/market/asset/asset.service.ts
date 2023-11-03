import { Injectable, Logger } from '@nestjs/common';
import { ChildApiService } from '../child_api/child_api.service';
import { TFulfilledYfPrice, TYfInfo, TYfPrice, TFulfilledYfInfo } from './type';
import { Exchange } from '../exchange/class/exchange';
import { ExchangeService } from '../exchange/exchange.service';
import { eitherMap } from 'src/common/class/either';
import * as F from '@fxts/core';

@Injectable()
export class AssetService {

  private readonly logger = new Logger('Market_' + AssetService.name);

  constructor(
    private readonly childApiSrv: ChildApiService,
    private readonly exchangeSrv: ExchangeService
  ) {}

  public async fetchInfo(ticker: string) {
    return (await this.childApiSrv.fetchYfInfo(ticker))
    .map(v => Object.assign(v.info, v.fastinfo, v.metadata, v.price) as TYfInfo);
  }

  public async fetchPrice(ticker: string) {
    return (await this.childApiSrv.fetchYfPrice(ticker))
    .map(v => Object.assign(v, { symbol: ticker }) as TYfPrice);
  };

  public fetchInfoArr(tickerArr: string[]) {
    return F.pipe(
      tickerArr, F.toAsync,
      F.map(this.fetchInfo.bind(this)),
      F.concurrent(this.childApiSrv.CONCURRENCY),
      F.toArray
    );
  }

  public fetchFulfilledInfoArr(tickerArr: string[]) {
    return F.pipe(
      tickerArr, F.toAsync,
      F.map(this.fetchInfo.bind(this)),
      F.map(eitherMap(this.fulfillYfInfo.bind(this))),
      F.concurrent(this.childApiSrv.CONCURRENCY),
      F.toArray
    );
  }

  public fetchFulfilledPriceArr(exchange: Exchange, tickerArr: string[]) {
    return F.pipe(
      tickerArr, F.toAsync,
      F.map(this.fetchPrice.bind(this)),
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
