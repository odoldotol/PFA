import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import {
  firstValueFrom,
  map
} from 'rxjs';
import {
  GET_ALL_EXCHANGES,
  INQUIRE_ASSET,
  GET_PRICE_BY_EXCHANGE,
} from './const';
import {
  ExchangeCore,
  FinancialAssetCore,
  PriceTuple,
  Ticker
} from 'src/common/interface';

@Injectable()
export class MarketApiService {

  private readonly runningFetchFinancialAsset = new Map<Ticker, Promise<FinancialAssetCore>>();

  constructor(
    private httpService: HttpService
  ) {}

  /**
   * @todo refac (SpDoc -> exchange)
   */
  public fetchAllSpDoc() {
    return firstValueFrom(this.httpService.get(GET_ALL_EXCHANGES).pipe(
      map(res => res.data as ExchangeCore[])
    ));
  }

  public fetchPriceByISOcode(ISO_Code: string) {
    return firstValueFrom(this.httpService.post(GET_PRICE_BY_EXCHANGE + ISO_Code).pipe(
      map(res => res.data as PriceTuple[])
    ));
  }

  /**
   * - 배치 프로세싱
   */
  public fetchFinancialAsset(ticker: Ticker): Promise<FinancialAssetCore> {
    if (this.runningFetchFinancialAsset.has(ticker)) {
      return this.runningFetchFinancialAsset.get(ticker)!;
    }

    const fetchFinancialAsset = firstValueFrom(this.httpService.post(INQUIRE_ASSET + ticker).pipe(
      map(res => res.data as FinancialAssetCore)
    )).finally(() => this.runningFetchFinancialAsset.delete(ticker));

    this.runningFetchFinancialAsset.set(ticker, fetchFinancialAsset);

    return fetchFinancialAsset;
  }
}
