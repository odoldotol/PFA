import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from 'src/http/http.service';
import {
  EnvironmentVariables,
  ExchangeIsoCode,
  Ticker,
  YfInfo,
  YfPrice
} from 'src/common/interface';
import { EnvKey } from 'src/common/enum';
import { ExchangeSession } from '../interface';
import {
  ChildError,
  ChildResponseEcSession,
  ChildResponseYfInfo,
  ChildResponseYfPrice
} from './interface';
import { 
  YFINANCE_INFO_URN,
  YFINANCE_PRICE_URN,
  EXCHANGE_SESSION_URN
} from './const';
import { firstValueFrom, map } from 'rxjs';
import Either from "src/common/class/either";

@Injectable()
export class ChildApiService {

  // Todo: 동시성 재한 리팩터링
  public readonly CONCURRENCY = this.configService.get(
    EnvKey.CHILD_CONCURRENCY,
    1,
    { infer: true }
  ) * 50;

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly httpService: HttpService
  ) {}

  // Todo: Refac - 겹치는 키에 다른 데이터가 있음. assign 순서에 의존하는 방식은 맘에 들지 않음.
  public async fetchYfInfo(
    ticker: Ticker
  ): Promise<Either<ChildError, YfInfo>> {
    return (await this.post<ChildResponseYfInfo>(YFINANCE_INFO_URN + ticker))
    .map(data => Object.assign(
      data.info,
      data.fastinfo,
      data.metadata,
      data.price
    ));
  }

  public async fetchYfPrice(
    ticker: Ticker
  ): Promise<Either<ChildError, YfPrice>> {
    return (await this.post<ChildResponseYfPrice>(YFINANCE_PRICE_URN + ticker))
    .map(data => Object.assign(
      data,
      { symbol: ticker }
    ));
  }

  public async fetchEcSession(
    isoCode: ExchangeIsoCode
  ): Promise<Either<ChildError, ExchangeSession>> {
    return (await this.post<ChildResponseEcSession>(EXCHANGE_SESSION_URN + isoCode))
    .map(v => ({
      previousOpen: new Date(v.previous_open),
      previousClose: new Date(v.previous_close),
      nextOpen: new Date(v.next_open),
      nextClose: new Date(v.next_close),
    }));
  }

  // Todo: Refac
  private post<T>(url: string): Promise<Either<ChildError, T>> {
    return firstValueFrom(this.httpService.post(url).pipe(
      map(res => res.data),
      map(data => data.error ? Either.left(data.error) : Either.right(data))
    ));
  }

}
