import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom, map } from 'rxjs';
import {
  GET_ALL_EXCHANGES_URN,
  INQUIRE_ASSET_URN,
  GET_PRICE_BY_EXCHANGE_URN,
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

  public fetchAllSpDoc() {
    return firstValueFrom(this.httpService.get(GET_ALL_EXCHANGES_URN).pipe(
      map(res => res.data as ExchangeCore[])
    ));
  }

  public fetchPriceByISOcode(ISO_Code: string) {
    return firstValueFrom(this.httpService.post(GET_PRICE_BY_EXCHANGE_URN + ISO_Code).pipe(
      map(res => res.data as PriceTuple[])
    ));
  }

  public fetchFinancialAsset(ticker: string): Promise<FinancialAssetCore> {
    return firstValueFrom(this.httpService.post(INQUIRE_ASSET_URN + ticker).pipe(
      catchError(error => {
        if (error.response?.data.error === "Bad Request") throw new BadRequestException(error.response.data);
        else if (error.response?.data.error === "Not Found") throw new NotFoundException(error.response.data);
        else if (error.response) throw new InternalServerErrorException(error.response.data);
        else throw new InternalServerErrorException(error);
      }),
      map(res => res.data as FinancialAssetCore)
    ));
  }

}
