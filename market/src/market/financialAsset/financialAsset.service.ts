import {
  Injectable,
  InternalServerErrorException,
  Logger
} from '@nestjs/common';
import { ChildApiConfigService } from 'src/config';
import {
  ConnectionService,
  YfinanceApiService
} from '../childApi';
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
import {
  ChildError,
  ChildResponseYfInfo,
  ChildResponseYfPrice
} from '../childApi/interface';
import Either, * as E from 'src/common/class/either';
import {
  isHttpResponse4XX,
  retryUntilResolvedOrTimeout
} from 'src/common/util';
import * as X from 'rxjs';
import * as F from '@fxts/core';

@Injectable()
export class Market_FinancialAssetService {

  private readonly logger = new Logger(Market_FinancialAssetService.name);

  constructor(
    private readonly childApiConnectionSrv: ConnectionService,
    private readonly childApiConfigSrv: ChildApiConfigService,
    private readonly yfinanceApiSrv: YfinanceApiService,
    private readonly exchangeSrv: Market_ExchangeService,
  ) {}

  public fetchYfInfosByEitherTickerArr(
    eitherTickerArr: readonly Either<any, Ticker>[]
  ): Promise<Either<any/* */, YfInfo>[]> {

    const makeTask = (ticker: Ticker) =>
      async () => X.lastValueFrom(await this.yfinanceApiSrv.fetchYfInfo(ticker));

    if (0 < eitherTickerArr.length) {
      return F.pipe(
        eitherTickerArr, F.toAsync,
        F.map(E.map(makeTask)),
        F.map(E.flatMap(task => E.wrapPromise(this.warpRetry(task)))),
        F.map(E.map(this.getYfInfo.bind(this))),
        F.concurrent(eitherTickerArr.length),
        F.toArray
      );
    } else {
      return Promise.resolve([]);
    }
  }

  // /**
  //  * ### admin 용도로만 사용 될 예정인 임시 함수.
  //  * ChildApi 의 구현에 의존하고 있음.
  //  */
  // public async fetchYfInfoArrByEitherTickerArr(
  //   eitherTickerArr: readonly Either<any, Ticker>[]
  // ): Promise<Either<any/* */, YfInfo>[]> {
  //   const eitherYfInfoArr = await this.yfinanceApiSrv.fetchYfInfoArr(E.getRightArray(eitherTickerArr));

  //   /*
  //   ChildApi 의 구현으로부터 eitherYfInfoArr 은 다음을 보장함.
  //   - eitherYfInfoArr.length === E.getRightArray(eitherTickerArr).length
  //   - eitherYfInfoArr 는 E.getRightArray(eitherTickerArr) 의 순서를 따름.

  //   이 전제로부터 아래 코드를 신뢰가능.
  //   */

  //   let i = 0;
  //   return F.pipe(
  //     eitherTickerArr, F.toAsync,
  //     F.map(E.flatMap(_ => eitherYfInfoArr[i++]!)),
  //     F.toArray
  //   );
  // }

  /**
   * - PriceRequestStrategy 에 따라 요청을 다르게 함.
   *    - single: 티커당 1 요청 발생 (각각의 요청의 실패시 필요한만큼 재요청 발생)
   *    - multi: 티커배열로 하나의 요청 발생 -> 차일드 서버의 능력에 맞춰 티커배열을 나눠서 1개 내지 복수의 요청 발생(차일드의 쓰레드풀 수, 워커수 등과 밀접하게 연관)
   * 
   * - childApi 의 health check 후에 요청함. (healthy 를 기다릴 수 있음)
   * 
   * @todo multi 에서 티커배열을 나눠서 복수의 요청으로 처리하기
   */
  public async fetchFulfilledYfPriceByTickerArr(
    isoCode: ExchangeIsoCode,
    tickerArr: readonly Ticker[]
  ): Promise<Either<any, FulfilledYfPrice>[]> {
    await this.childApiConnectionSrv.checkHealth();

    const marketExchange = this.exchangeSrv.getOne(isoCode);

    if (this.childApiConfigSrv.isPriceRequestStrategySingle()) { // 티커당 1 요청
      const makeTask = (ticker: Ticker) =>
        async () => X.lastValueFrom(await this.yfinanceApiSrv.fetchYfPrice(ticker));

      return F.pipe(
        tickerArr, F.toAsync,
        F.map(makeTask),
        F.map(task => E.wrapPromise(this.warpRetry(task))),
        F.map(E.map(this.getYfPrice.bind(this, isoCode))),
        F.map(E.flatMap(this.fulfillYfPrice.bind(this, marketExchange))),
        F.concurrent(tickerArr.length),
        F.toArray
      );
    } else if (this.childApiConfigSrv.isPriceRequestStrategyMulti()) { // 1 요청 -> 차일드 서버의 능력에 맞춰 1개 내지 복수의 요청으로 해결
      const childResYfPrices
      = await X.lastValueFrom(await this.yfinanceApiSrv.fetchYfPriceArr(tickerArr))
      .catch(e => {
        throw new InternalServerErrorException(e);
      });

      return Promise.all(childResYfPrices
        .map((ele, idx): Either<ChildError, YfPrice> => { // ChildResponseYfPrices -> Either<ChildError, YfPrice>[]
          if ('regularMarketPrice' in ele) {
            return Either.right(this.getYfPrice(tickerArr[idx]!, ele));
          } else {
            return Either.left(ele);
          }
        })
        .map(E.flatMap(this.fulfillYfPrice.bind(this, marketExchange)))); // Either<ChildError, YfPrice>[] -> Either<any, FulfilledYfPrice>[]
    } else { // never
      throw new Error('[Never] Invalid PriceRequestStrategy');
    }
  }

  // todo: yf 엔티티 리팩터링
  public fulfillYfInfo(
    yfInfo: YfInfo
  ): Promise<Either<any, FulfilledYfInfo>> {
    const marketExchange = this.exchangeSrv.findOneByYfInfo(yfInfo);

    return this.fulfillYfPrice(
      marketExchange,
      yfInfo
    ).map(fulfilledYfPrice => Object.assign(
      yfInfo,
      { marketExchange },
      fulfilledYfPrice
    ));
  }

  // todo: yf 엔티티 리팩터링
  private fulfillYfPrice(
    exchange: Market_Exchange | null,
    {
      symbol, 
      regularMarketPreviousClose,
      regularMarketPrice
    }: YfPrice
  ): Either<any, FulfilledYfPrice> {
    const price = exchange?.isMarketOpen() ? {
      liveMarketPrice: regularMarketPrice,
      regularMarketLastClose: regularMarketPreviousClose,
      regularMarketPreviousClose: null
    } : {
      liveMarketPrice: null,
      regularMarketLastClose: regularMarketPrice,
      regularMarketPreviousClose
    }

    if (price.regularMarketLastClose === null) {
      return Either.left(new Error('regularMarketLastClose is null')); // temp
    }

    return Either.right({
      symbol,
      liveMarketPrice: price.liveMarketPrice,
      regularMarketLastClose: price.regularMarketLastClose,
      regularMarketPreviousClose: price.regularMarketPreviousClose
    });
  }

  /**
   * ChildResponseYfInfo -> YfInfo
   * - currency 없는경우 처리
   * 
   * @todo Refac - 겹치는 키에 다른 데이터가 있음. assign 순서에 의존하는 방식은 맘에 들지 않음.
   */
  private getYfInfo(childYfInfo: ChildResponseYfInfo): YfInfo {
    if (!childYfInfo.info) {
      this.logger.warn(`${childYfInfo.metadata.symbol} : No info`); //
    }

    const result = Object.assign(
      {},
      childYfInfo.info,
      childYfInfo.fastinfo,
      childYfInfo.metadata,
      childYfInfo.price
    );

    /*
    Todo: currency 가 없는 경우가 있음. 이 경우 financialCurrency 를 사용하도록 하자.
    코스닥의 경우 financialCurrency 이마저도 없는 경우가 있음.
    아마 다른 시장에서도 있을텐데 일단은 아래처럼 간단하게 처리하고 넘어가고, Currency 와 Money 관련해서는 종확한 솔루션을 마련하는게 좋음.
    */
    if (!result.currency) {
      if (result.financialCurrency) {
        result.currency = result.financialCurrency;
      } else {
        if (result.exchangeTimezoneName === 'Asia/Seoul') {
          result.currency = 'KRW';
        } else {
          result.currency = 'N/A';
          this.logger.warn(`${result.symbol} : No currency`);
        }
      }
    }
    return result
  }

  private getYfPrice(
    ticker: Ticker,
    childYfPrice: ChildResponseYfPrice
  ): YfPrice {
    return Object.assign(
      childYfPrice,
      { symbol: ticker }
    );
  }

  private warpRetry<T>(task: () => Promise<T>) {
    return retryUntilResolvedOrTimeout(task, {
      interval: 10,
      timeout: 1000 * 180,
      rejectCondition: isHttpResponse4XX
    });
  }

}
