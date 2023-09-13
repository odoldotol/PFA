import { Injectable, Logger } from '@nestjs/common';
import { ChildApiService } from '../child_api/child_api.service';
import { TFulfilledYfPrice, TYfInfo, TYfPrice } from './type';
import { Exchange } from '../exchange/class/exchange';
import * as F from '@fxts/core';

@Injectable()
export class AssetService {

  private readonly logger = new Logger('Market_' + AssetService.name);

  constructor(
    private readonly childApiService: ChildApiService
  ) {}

  public async fetchInfo(ticker: string) {
    return (await this.childApiService.fetchYfInfo(ticker))
    .map(v => Object.assign(v.info, v.fastinfo, v.metadata, v.price) as TYfInfo);
  }

  public async fetchPrice(ticker: string) {
    return (await this.childApiService.fetchYfPrice(ticker))
    .map(v => Object.assign(v, { symbol: ticker }) as TYfPrice);
  };

  public fetchFulfilledPriceArr(exchange: Exchange, tickerArr: string[]) {
    return F.pipe(
      tickerArr, F.toAsync,
      F.map(this.fetchPrice.bind(this)),
      F.map(ele => ele.map(this.fulfillYfPrice.bind(this, exchange))),
      F.concurrent(this.childApiService.Concurrency),
      F.toArray
    );
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
