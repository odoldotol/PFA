import { Injectable } from '@nestjs/common';
import { YfinanceApiService } from '../childApi';
import { Market_ExchangeService } from '../exchange';
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
    if (0 < eitherTickerArr.length) {
      return F.pipe(
        eitherTickerArr, F.toAsync,
        F.map(E.flatMap(this.yfinanceApiSrv.fetchYfInfo.bind(this.yfinanceApiSrv))),
        F.concurrent(eitherTickerArr.length), // 0 이면 여기서 오류.
        F.toArray
      );
    } else {
      return Promise.resolve([]);
    }
  }

  /**
   * ### admin 용도로만 사용 될 예정인 임시 함수.
   * ChildApi 의 구현에 의존하고 있음.
   */
  public async fetchYfInfoArrByEitherTickerArr(
    eitherTickerArr: readonly Either<any, Ticker>[]
  ): Promise<Either<any/* */, YfInfo>[]> {
    const eitherYfInfoArr = await this.yfinanceApiSrv.fetchYfInfoArr(E.getRightArray(eitherTickerArr));

    /*
    ChildApi 의 구현으로부터 eitherYfInfoArr 은 다음을 보장함.
    - eitherYfInfoArr.length === E.getRightArray(eitherTickerArr).length
    - eitherYfInfoArr 는 E.getRightArray(eitherTickerArr) 의 순서를 따름.

    이 전제로부터 아래 코드를 신뢰가능.
    */

    let i = 0;
    return F.pipe(
      eitherTickerArr, F.toAsync,
      F.map(E.flatMap(_ => eitherYfInfoArr[i++]!)),
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
    if (0 < tickerArr.length) {
      return F.pipe(
        tickerArr, F.toAsync,
        F.map(this.yfinanceApiSrv.fetchYfPrice.bind(this.yfinanceApiSrv)),
        F.concurrent(tickerArr.length), // 0 이면 여기서 오류.
        F.toArray
      );
    } else {
      return Promise.resolve([]);
    }
  }

}
