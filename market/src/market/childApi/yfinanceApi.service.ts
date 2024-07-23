import {
  Injectable,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ChildApiService } from './childApi.service';
import {
  Ticker,
} from 'src/common/interface';
import {
  ChildResponseYfInfo,
  // ChildResponseYfInfos,
  ChildResponseYfPrice,
  ChildResponseYfPrices,
} from './interface';
import { 
  YFINANCE_INFO_URN,
  YFINANCE_PRICE_URN,
} from './const';
import { Observable } from 'rxjs';

@Injectable()
export class YfinanceApiService {

  constructor(
    private readonly httpService: HttpService,
    private readonly childApiSrv: ChildApiService,
  ) {}

  public fetchYfInfo(
    ticker: Ticker
  ): Promise<Observable<ChildResponseYfInfo>> {
    const req = () => this.httpService.post<ChildResponseYfInfo>(
      YFINANCE_INFO_URN + "/" + ticker
    );

    return this.childApiSrv.withConcurrencyQueue(req);
  }

  // /**
  //  * @todo childApi 에서 해당하는 api 를 쓰레드풀 이용해서 비동기적으로 동작하도록 수정해야함.
  //  * @todo childApi 에서 해당하는 api 의 응답 폼을 수정해야함. 그냥 배열에 순서대로 성공 실패 다 담아야함.
  //  * @todo 그 후, 이 함수도 수정해야함.
  //  */
  // public async fetchYfInfoArr(
  //   tickerArr: Ticker[]
  // ): Promise<Either<ChildError, YfInfo>[]> {
  //   const childApiInfos = await this.childApiSrv.post<ChildResponseYfInfos>(
  //     YFINANCE_INFO_URN,
  //     { data: tickerArr }
  //   );

  //   if (childApiInfos.isLeft()) {
  //     throw childApiInfos.left;
  //   }

  //   const { infos, exceptions } = childApiInfos.right;

  //   /*
  //   이 상태에서 ChildApi 는 다음을 보장함.
  //   - infos.length + exceptions.length === tickerArr.length
  //   - infos 와 exceptions 가 tickerArr 의 순서를 따름.

  //   이 전제로부터 아래 코드를 신뢰가능.
  //   */

  //   const result: Either<ChildError, YfInfo>[] = [];

  //   let infosIdx = 0;
  //   let exceptionsIdx = 0;
  //   for (let i = 0; i < tickerArr.length; i++) {
  //     const ticker = tickerArr[i]!;
  //     const info = infos[infosIdx];
  //     const exception = exceptions[exceptionsIdx];
  //     if (info && info.metadata.symbol === ticker) {
  //       result.push(Either.right(this.getYfInfo(info)));
  //       infosIdx++;
  //     } else if (exception && exception.ticker === ticker) {
  //       result.push(Either.left(exception!));
  //       exceptionsIdx++;
  //     } else {
  //       // ChildApi 가 의도한 데로 응답했다면 진입할 수 없음.
  //       throw new Error('Unexpected ChildApi response.');
  //     }
  //   }

  //   if (infosIdx !== infos.length || exceptionsIdx !== exceptions.length) {
  //     this.logger.warn('Unexpected ChildApi response.');
  //   }

  //   return result;
  // }

  public fetchYfPrice(
    ticker: Ticker
  ): Promise<Observable<ChildResponseYfPrice>> {
    const req = () => this.httpService.post<ChildResponseYfPrice>(
      YFINANCE_PRICE_URN + "/" + ticker
    );

    return this.childApiSrv.withConcurrencyQueue(req);
  }

  /**
   * - 1 워커 기준으로 구현함. 동시성큐를 일시정지시켜서 차일드가 다른 요청을 받지 않도록 함. 요청이 끝나면 동시성큐를 재개시킴.
   * @todo 워커가 1개 이상일 때는, CHILD_THREADPOOL_WORKERS 제한 만큼의 티커를 하나의 요청만들어서 워커큐를 통해서 각 워커에 보내야한다.
   */
  public async fetchYfPriceArr(
    tickerArr: readonly Ticker[]
  ): Promise<Observable<ChildResponseYfPrices>> {
    const req = () => this.httpService.post<ChildResponseYfPrices>(
      YFINANCE_PRICE_URN,
      tickerArr
    );

    const resumeConcurrencyQueue = this.childApiSrv.pauseConcurrencyQueue();
    
    const result = await this.childApiSrv.withWorkersQueue(req);

    result.subscribe({
      complete: resumeConcurrencyQueue
    });

    return result;
  }
}
