import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom, map } from 'rxjs';
import {
  ALLEXCHANGES_URN,
  ASSET_INQIRE_URN,
  PRICEASSETS_BY_EXCHANGE_URN,
  PRICEASSET_BY_TICKER_URN
} from './const';
import { FinancialAssetCore } from 'src/common/interface';

@Injectable()
export class MarketApiService {

  constructor(
    private httpService: HttpService
  ) {}

  public fetchAllSpDoc() {
    return firstValueFrom(this.httpService.get(ALLEXCHANGES_URN).pipe(
      map(res => res.data as StatusPrice[])
    ));
  }

  public fetchPriceByISOcode(ISO_Code: string) {
    return firstValueFrom(this.httpService.post(PRICEASSETS_BY_EXCHANGE_URN + ISO_Code).pipe(
      map(res => res.data as PSet[])
    ));
  }

  public fetchFinancialAsset(ticker: string): Promise<FinancialAssetCore> {
    return firstValueFrom(this.httpService.post(ASSET_INQIRE_URN + ticker).pipe(
      map(res => res.data as FinancialAssetCore)
    ));
  }

  public fetchPriceByTicker(ticker: string) {
    return firstValueFrom(this.httpService.post(PRICEASSET_BY_TICKER_URN + ticker).pipe(
      catchError(error => {
        if (error.response?.data.error === "Bad Request") throw new BadRequestException(error.response.data);
        else if (error.response?.data.error === "Not Found") throw new NotFoundException(error.response.data);
        else if (error.response) throw new InternalServerErrorException(error.response.data);
        else throw new InternalServerErrorException(error);
      }),
      map(res => res.data as RequestedPrice)
    ));
  }

}
