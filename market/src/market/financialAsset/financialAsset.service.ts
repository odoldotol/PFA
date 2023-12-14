import { Injectable } from '@nestjs/common';
import { ChildApiService } from '../child_api/child_api.service';
import { Ticker } from 'src/common/interface';
import Either, * as E from 'src/common/class/either';
import * as F from '@fxts/core';

// Todo: 동시성 재한 리팩터링
@Injectable()
export class Market_FinancialAssetService {

  constructor(
    private readonly childApiSrv: ChildApiService
  ) {}

  public fetchYfInfos(tickerArr: readonly Ticker[]) {
    return F.pipe(
      tickerArr, F.toAsync,
      F.map(this.childApiSrv.fetchYfInfo.bind(this.childApiSrv)),
      F.concurrent(this.childApiSrv.CONCURRENCY),
      F.toArray
    );
  }

  public fetchYfInfosByEitherTickerArr(
    eitherTickerArr: readonly Either<any, Ticker>[]
  ) {
    return F.pipe(
      eitherTickerArr, F.toAsync,
      F.map(E.flatMap(this.childApiSrv.fetchYfInfo.bind(this.childApiSrv))),
      F.concurrent(this.childApiSrv.CONCURRENCY),
      F.toArray
    );
  }

  public fetchYfPrices(tickerArr: readonly Ticker[]) {
    return F.pipe(
      tickerArr, F.toAsync,
      F.map(this.childApiSrv.fetchYfPrice.bind(this.childApiSrv)),
      F.concurrent(this.childApiSrv.CONCURRENCY),
      F.toArray
    );
  }

}
