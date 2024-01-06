import { Injectable } from '@nestjs/common';
import { ChildApiService } from './childApi.service';
import {
  Ticker,
  YfInfo,
  YfPrice
} from 'src/common/interface';
import {
  ChildError,
  ChildResponseYfInfo,
  ChildResponseYfPrice
} from './interface';
import { 
  YFINANCE_INFO_URN,
  YFINANCE_PRICE_URN,
} from './const';
import Either, * as E from "src/common/class/either";

@Injectable()
export class YfinanceApiService {

  constructor(
    private readonly childApiSrv: ChildApiService,
  ) {}

  public fetchYfInfo(
    ticker: Ticker
  ): Promise<Either<ChildError, YfInfo>> {
    return this.childApiSrv.post<ChildResponseYfInfo>(
      YFINANCE_INFO_URN + ticker
    ).then(E.map(this.getYfInfo));
  }

  public fetchYfPrice(
    ticker: Ticker
  ): Promise<Either<ChildError, YfPrice>> {
    return this.childApiSrv.post<ChildResponseYfPrice>(
      YFINANCE_PRICE_URN + ticker
    ).then(E.map(this.getYfPrice.bind(null, ticker)));
  }

  // Todo: Refac - 겹치는 키에 다른 데이터가 있음. assign 순서에 의존하는 방식은 맘에 들지 않음.
  private getYfInfo(childYfInfo: ChildResponseYfInfo) {
    return Object.assign(
      childYfInfo.info,
      childYfInfo.fastinfo,
      childYfInfo.metadata,
      childYfInfo.price
    );
  }

  private getYfPrice(ticker: Ticker, childYfPrice: ChildResponseYfPrice) {
    return Object.assign(
      childYfPrice,
      { symbol: ticker }
    );
  }

}
