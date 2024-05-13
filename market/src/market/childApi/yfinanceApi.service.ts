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
  ChildError,
  ChildResponseYfInfo,
  ChildResponseYfInfos,
  ChildResponseYfPrice
} from './interface';
import { 
  YFINANCE_INFO_URN,
  YFINANCE_PRICE_URN,
} from './const';
import Either, * as E from "src/common/class/either";

@Injectable()
export class YfinanceApiService {

  private readonly logger = new Logger(YfinanceApiService.name);

  constructor(
    private readonly childApiSrv: ChildApiService,
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
   */
  public async fetchYfInfoArr(
    tickerArr: Ticker[]
  ): Promise<Either<ChildError, YfInfo>[]> {
    const childApiInfos = await this.childApiSrv.post<ChildResponseYfInfos>(
      YFINANCE_INFO_URN,
      tickerArr
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
      YFINANCE_PRICE_URN + ticker
    ).then(E.map(this.getYfPrice.bind(null, ticker)));
  }

  // Todo: Refac - 겹치는 키에 다른 데이터가 있음. assign 순서에 의존하는 방식은 맘에 들지 않음.
  private getYfInfo(childYfInfo: ChildResponseYfInfo): YfInfo {
    if (!childYfInfo.info) {
      this.logger.warn(`${childYfInfo.metadata.symbol} : No info`); //
    }
    return Object.assign(
      {},
      childYfInfo.info,
      childYfInfo.fastinfo,
      childYfInfo.metadata,
      childYfInfo.price
    );
  }

  private getYfPrice(ticker: Ticker, childYfPrice: ChildResponseYfPrice): YfPrice {
    return Object.assign(
      childYfPrice,
      { symbol: ticker }
    );
  }

}
