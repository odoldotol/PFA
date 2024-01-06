import { Injectable } from '@nestjs/common';
import { YfinanceApiService } from '../childApi/yfinanceApi.service';
import { Ticker, YfInfo, YfPrice } from 'src/common/interface';
import Either, * as E from 'src/common/class/either';
import * as F from '@fxts/core';

@Injectable()
export class Market_FinancialAssetService {

  constructor(
    private readonly yfinanceApiSrv: YfinanceApiService
  ) {}

  public fetchYfInfos(
    tickerArr: readonly Ticker[]
  ): Promise<Either<any/* */, YfInfo>[]> {
    return F.pipe(
      tickerArr, F.toAsync,
      F.map(this.yfinanceApiSrv.fetchYfInfo.bind(this.yfinanceApiSrv)),
      F.toArray
    );
  }

  public fetchYfInfosByEitherTickerArr(
    eitherTickerArr: readonly Either<any, Ticker>[]
  ): Promise<Either<any/* */, YfInfo>[]> {
    return F.pipe(
      eitherTickerArr, F.toAsync,
      F.map(E.flatMap(this.yfinanceApiSrv.fetchYfInfo.bind(this.yfinanceApiSrv))),
      F.toArray
    );
  }

  public fetchYfPrices(
    tickerArr: readonly Ticker[]
  ): Promise<Either<any/* */, YfPrice>[]> {
    return F.pipe(
      tickerArr, F.toAsync,
      F.map(this.yfinanceApiSrv.fetchYfPrice.bind(this.yfinanceApiSrv)),
      F.toArray
    );
  }

}
