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
  PriceTuple
} from 'src/common/interface';

@Injectable()
export class MarketApiService {

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

  public fetchFinancialAsset(ticker: string): Promise<FinancialAssetCore> {
    return firstValueFrom(this.httpService.post(INQUIRE_ASSET + ticker).pipe(
      map(res => res.data as FinancialAssetCore)
    ));
  }

}
