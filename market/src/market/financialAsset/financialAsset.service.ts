import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  ChildApiConfigService,
  YAHOO_FINANCE_CCC_EXCHANGE_ISO_CODE
} from 'src/config';
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
import Either, * as E from 'src/common/class/either';
import * as X from 'rxjs';
import * as F from '@fxts/core';

@Injectable()
export class Market_FinancialAssetService {

  constructor(
    private readonly childApiConnectionSrv: ConnectionService,
    private readonly childApiConfigSrv: ChildApiConfigService,
    private readonly yfinanceApiSrv: YfinanceApiService,
    private readonly exchangeSrv: Market_ExchangeService,
  ) {}

  public fetchYfInfosByEitherTickerArr(
    eitherTickerArr: readonly Either<any, Ticker>[]
  ): Promise<Either<any/* */, YfInfo>[]> {

    const fetchYfInfo = async (ticker: Ticker) => {
      return X.lastValueFrom(await this.yfinanceApiSrv.fetchYfInfoWithRetry(ticker));
    };

    if (0 < eitherTickerArr.length) {
      return F.pipe(
        eitherTickerArr,
        F.toAsync,
        F.map(E.wrapAsyncFlatMap(fetchYfInfo)),
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

    const fulfillYfPrice = this.fulfillYfPrice.bind(this, this.exchangeSrv.getOne(isoCode));

    if (this.childApiConfigSrv.isPriceRequestStrategySingle()) { // 티커당 1 요청

      const fetchYfPrice = async (ticker: Ticker) => {
        return X.lastValueFrom(await this.yfinanceApiSrv.fetchYfPrice(ticker));
      };

      return F.pipe(
        tickerArr,
        F.toAsync,
        F.map(E.wrapAsync(fetchYfPrice)),
        F.map(E.wrapFlatMap(fulfillYfPrice)),
        F.concurrent(tickerArr.length),
        F.toArray
      );

    } else if (this.childApiConfigSrv.isPriceRequestStrategyMulti()) { // 1 요청 -> 차일드 서버의 능력에 맞춰 1개 내지 복수의 요청으로 해결

      return X.lastValueFrom(
        (await this.yfinanceApiSrv.fetchYfPriceArr(tickerArr))
        .pipe(
          X.map(yfPriceEitherArr => yfPriceEitherArr.map(E.wrapFlatMap(fulfillYfPrice)))
        )
      ).catch(e => {
        throw new InternalServerErrorException(e);
      });

    } else { // never
      // Todo: TS 가 never 추론할 수 있도록 PriceRequestStrategy 를 다시 정의하자.
      // priceRequestStrategy satisfies never; ??
      throw new Error('[Never] Invalid PriceRequestStrategy');
    }
  }

  // todo: yf 엔티티 리팩터링
  public fulfillYfInfo(
    yfInfo: YfInfo
  ): FulfilledYfInfo {
    const marketExchange = this.exchangeSrv.findOneByYfInfo(yfInfo);
    const fulfillYfPrice = this.fulfillYfPrice.bind(this, marketExchange);

    return Object.assign(
      yfInfo,
      { marketExchange },
      fulfillYfPrice(yfInfo)
    );
  }

  // todo: yf 엔티티 리팩터링
  private fulfillYfPrice(
    exchange: Market_Exchange | null,
    yfPrice: YfPrice
  ): FulfilledYfPrice {
    let liveMarketPrice: number | null = null;
    let regularMarketLastClose: number | null = null;
    let regularMarketPreviousClose: number | null = null;

    const isMarketOpen = (() => {
      if (exchange === null) {
        // Todo: yahoofinance 에서 metadata 로 currentTradingPeriod 를 제공하기때문에 이를 이용하면 지금 마켓상태를 알 수 있음.
        return false;
      }

      // 항상 open 인 exchange 를 알수있는 인터페이스를 exchange 가 제공할 필요가 있음. 
      if (exchange.isoCode === YAHOO_FINANCE_CCC_EXCHANGE_ISO_CODE) {
        // Todo: 업데이트 기준으로는 항상 닫힌것처럼 처리하는게 타당함. 하지만 이는 24시간 운영하는 마켓의 특징을 반영한 옳바른 처리가 아님.
        return false;
      }

      return exchange.isMarketOpen();
    })();

    if (isMarketOpen) {
      liveMarketPrice = yfPrice.regularMarketPrice;
      regularMarketLastClose = yfPrice.regularMarketPreviousClose;
    } else {
      regularMarketLastClose = yfPrice.regularMarketPrice;
      regularMarketPreviousClose = yfPrice.regularMarketPreviousClose;
    }

    if (regularMarketLastClose === null) {
      throw new Error('regularMarketLastClose is null'); // temp, never?
    }

    return {
      symbol: yfPrice.symbol,
      liveMarketPrice,
      regularMarketLastClose,
      regularMarketPreviousClose
    };
  }

}
