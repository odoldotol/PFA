import {
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import {
  catchError,
  firstValueFrom,
  map
} from 'rxjs';
import {
  GET_ALL_EXCHANGES_PATH,
  INQUIRE_ASSET_PATH,
  GET_PRICE_BY_EXCHANGE_PATH,
} from './const';
import {
  ExchangeCore,
  FinancialAssetCore,
  PriceTuple,
  Ticker
} from 'src/common/interface';
import { joinSlash } from 'src/common/util';

@Injectable()
export class MarketApiService {

  private readonly runningFetchFinancialAsset = new Map<Ticker, Promise<FinancialAssetCore>>();

  constructor(
    private httpService: HttpService
  ) {}

  public fetchAllExchanges() {
    return firstValueFrom(this.httpService.get(GET_ALL_EXCHANGES_PATH).pipe(
      map(res => res.data as ExchangeCore[])
    ));
  }

  public fetchPriceTupleArrByISOcode(ISO_Code: string) {
    return firstValueFrom(this.httpService.get(joinSlash(GET_PRICE_BY_EXCHANGE_PATH, ISO_Code)).pipe(
      map(res => res.data as PriceTuple[])
    ));
  }

  /**
   * - 배치 프로세싱
   * @todo 프로젝트 전체 에러 처리 리팩터링
   */
  public fetchFinancialAsset(ticker: Ticker): Promise<FinancialAssetCore> {
    if (this.runningFetchFinancialAsset.has(ticker)) {
      return this.runningFetchFinancialAsset.get(ticker)!;
    }

    const fetchFinancialAsset = firstValueFrom(
      this.httpService.post<FinancialAssetCore>(joinSlash(INQUIRE_ASSET_PATH, ticker))
      .pipe(
        catchError(err => {
          if (err.response === undefined) {
            throw err;
          } else {
            switch (err.response.status) {
              case 404:
                throw new NotFoundException(err.response.data);
              default:
                throw new InternalServerErrorException(err.response.data);
            }
          }
        }),
        map(res => res.data)
      )
    ).finally(() => this.runningFetchFinancialAsset.delete(ticker));

    this.runningFetchFinancialAsset.set(ticker, fetchFinancialAsset);

    return fetchFinancialAsset;
  }
}
