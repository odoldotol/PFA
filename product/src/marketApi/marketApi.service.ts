import {
  BadRequestException,
  HttpStatus,
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

  /**
   * @todo refac (SpDoc -> exchange)
   */
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

  /**
   * @todo refac error handling <- marketChild 서버 에러던지도록 리팩터링 후
   */
  public fetchFinancialAsset(ticker: string): Promise<FinancialAssetCore> {
    return firstValueFrom(this.httpService.post(INQUIRE_ASSET_URN + ticker).pipe(
      catchError(error => {
        if (error.response?.status === HttpStatus.BAD_REQUEST) throw new BadRequestException(error.response.data);
        else if (error.response?.status === HttpStatus.NOT_FOUND) throw new NotFoundException(error.response.data);
        else if (error.response) throw new InternalServerErrorException(error.response.data);
        else throw new InternalServerErrorException(error);
      }),
      map(res => res.data as FinancialAssetCore)
    ));
  }

}
