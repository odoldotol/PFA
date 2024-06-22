import {
  Injectable,
  Logger
} from '@nestjs/common';
import { ChildApiService } from './childApi.service';
import {
  Ticker,
  YfInfo,
  YfPrice
} from 'src/common/interface';
import {
  InjectTaskQueue,
  TaskQueueService,
} from 'src/taskQueue';
import {
  ChildError,
  ChildResponseYfInfo,
  ChildResponseYfInfos,
  ChildResponseYfPrice,
  ChildResponseYfPrices,
} from './interface';
import { 
  YFINANCE_INFO_URN,
  YFINANCE_PRICE_URN,
  YF_PRICE_ARRAY_TASK_QUEUE_TOKEN,
} from './const';
import Either, * as E from "src/common/class/either";

@Injectable()
export class YfinanceApiService {

  private readonly logger = new Logger(YfinanceApiService.name);

  constructor(
    private readonly childApiSrv: ChildApiService,
    @InjectTaskQueue(YF_PRICE_ARRAY_TASK_QUEUE_TOKEN)
    private readonly yfPriceArrTaskQueueSrv: TaskQueueService
  ) {}

  public fetchYfInfo(
    ticker: Ticker
  ): Promise<Either<ChildError, YfInfo>> {
    return this.childApiSrv.post<ChildResponseYfInfo>(
      YFINANCE_INFO_URN + ticker
    ).then(E.map(this.getYfInfo.bind(this)));
  }

  /**
   * ### admin 용도로만 사용 될 예정인 임시 함수.
   * ChildApi 의 구현에 의존하고 있음.
   * 
   * @todo childApi 에서 해당하는 api 를 쓰레드풀 이용해서 비동기적으로 동작하도록 수정해야함.
   * @todo childApi 에서 해당하는 api 의 응답 폼을 수정해야함. 그냥 배열에 순서대로 성공 실패 다 담아야함.
   * @todo 그 후, 이 함수도 수정해야함.
   */
  public async fetchYfInfoArr(
    tickerArr: Ticker[]
  ): Promise<Either<ChildError, YfInfo>[]> {
    const childApiInfos = await this.childApiSrv.post<ChildResponseYfInfos>(
      YFINANCE_INFO_URN,
      { data: tickerArr }
    );

    if (childApiInfos.isLeft()) {
      throw childApiInfos.left;
    }

    const { infos, exceptions } = childApiInfos.right;

    /*
    이 상태에서 ChildApi 는 다음을 보장함.
    - infos.length + exceptions.length === tickerArr.length
    - infos 와 exceptions 가 tickerArr 의 순서를 따름.

    이 전제로부터 아래 코드를 신뢰가능.
    */

    const result: Either<ChildError, YfInfo>[] = [];

    let infosIdx = 0;
    let exceptionsIdx = 0;
    for (let i = 0; i < tickerArr.length; i++) {
      const ticker = tickerArr[i]!;
      const info = infos[infosIdx];
      const exception = exceptions[exceptionsIdx];
      if (info && info.metadata.symbol === ticker) {
        result.push(Either.right(this.getYfInfo(info)));
        infosIdx++;
      } else if (exception && exception.ticker === ticker) {
        result.push(Either.left(exception!));
        exceptionsIdx++;
      } else {
        // ChildApi 가 의도한 데로 응답했다면 진입할 수 없음.
        throw new Error('Unexpected ChildApi response.');
      }
    }

    if (infosIdx !== infos.length || exceptionsIdx !== exceptions.length) {
      this.logger.warn('Unexpected ChildApi response.');
    }

    return result;
  }

  public fetchYfPrice(
    ticker: Ticker
  ): Promise<Either<ChildError, YfPrice>> {
    return this.childApiSrv.post<ChildResponseYfPrice>(
      YFINANCE_PRICE_URN + "/" + ticker,
      {
        retryOptions: {
          interval: 1000,
          timeout: 1000 * 60
        }
      }
    ).then(E.map(this.getYfPrice.bind(null, ticker)));
  }

  /**
   * @todo CHILD_THREADPOOL_WORKERS 제한 만큼의 티커를 하나의 요청으로 보내야한다. 발생하는 요청수는 워커수와 일치하는것이 이상적이다. 한번에 업데이트하는 갯수에 맞춰서 조정해야한다.
   */
  public async fetchYfPriceArr(
    tickerArr: readonly Ticker[]
  ): Promise<Either<ChildError, YfPrice>[]> {
    const a = await this.yfPriceArrTaskQueueSrv.runTask(() => this.childApiSrv.post<ChildResponseYfPrices>(
      YFINANCE_PRICE_URN,
      { data: tickerArr }
    ));

    if (a.isLeft()) {
      throw a.left;
    }

    const result: Either<ChildError, YfPrice>[] = [];
    for (let i = 0; i < tickerArr.length; i++) {
      const ticker = tickerArr[i]!;
      const childYfPrice = a.right[i]!;
      if ('regularMarketPrice' in childYfPrice) {
        result.push(Either.right(this.getYfPrice(ticker, childYfPrice)));
      } else {
        result.push(Either.left(childYfPrice));
      }
    }
    return result;
  }

  // Todo: Refac - 겹치는 키에 다른 데이터가 있음. assign 순서에 의존하는 방식은 맘에 들지 않음.
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

  private getYfPrice(ticker: Ticker, childYfPrice: ChildResponseYfPrice): YfPrice {
    return Object.assign(
      childYfPrice,
      { symbol: ticker }
    );
  }
}
