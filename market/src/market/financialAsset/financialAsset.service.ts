import { Injectable, Logger } from '@nestjs/common';
import { ChildApiService } from '../child_api/child_api.service';
import { Either, eitherFlatMap } from 'src/common/class/either';
import * as F from '@fxts/core';

@Injectable()
export class Market_FinancialAssetService {

  private readonly logger = new Logger(Market_FinancialAssetService.name);

  constructor(
    private readonly childApiSrv: ChildApiService
  ) {}

  public fetchYfInfos(tickerArr: readonly string[]) {
    return F.pipe(
      tickerArr, F.toAsync,
      F.map(this.childApiSrv.fetchYfInfo.bind(this)),
      F.concurrent(this.childApiSrv.CONCURRENCY),
      F.toArray
    );
  }

  public fetchYfInfosByEitherTickerArr(eitherTickerArr: readonly Either<any, string>[]) {
    return F.pipe(
      eitherTickerArr, F.toAsync,
      F.map(eitherFlatMap(this.childApiSrv.fetchYfInfo.bind(this))),
      F.concurrent(this.childApiSrv.CONCURRENCY),
      F.toArray
    );
  }

  public fetchYfPrices(tickerArr: readonly string[]) {
    return F.pipe(
      tickerArr, F.toAsync,
      F.map(this.childApiSrv.fetchYfPrice.bind(this)),
      F.concurrent(this.childApiSrv.CONCURRENCY),
      F.toArray
    );
  }

}
