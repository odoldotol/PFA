import {
  Injectable,
  Logger
} from '@nestjs/common';
import { TempConfigService } from 'src/config';
import { HttpService } from 'src/http';
import {
  ExchangeCore,
  FulfilledYfPrice,
  Ticker,
  MarketDate
} from 'src/common/interface';
import { UPDATE_PRICE_BY_EXCHANGE_URN } from './const';
import { firstValueFrom } from 'rxjs';
import Either, * as E from 'src/common/class/either';

@Injectable()
export class ProductApiService {

  private readonly logger = new Logger(ProductApiService.name);
  private readonly TEMP_KEY = this.tempConfigSrv.getKey();

  constructor(
    private readonly tempConfigSrv: TempConfigService,
    private readonly httpService: HttpService,
  ) {}

  public async updatePriceByExchange(
    exchange: ExchangeCore,
    updateResult: Either<any, FulfilledYfPrice>[]
  ) {
    const isoCode = exchange.isoCode;
    const data: updatePriceByExchangeData = {
      marketDate: exchange.marketDate,
      priceArrs: E.getRightArray(updateResult).map(this.convertToUpdateTuple)
    };

    const httpCb = () => firstValueFrom(this.httpService.post(
      UPDATE_PRICE_BY_EXCHANGE_URN + isoCode,
      this.addKey(data)
    ));

    await this.httpService.tryUntilResolved(
      1000,
      1000 * 5,
      httpCb
    ).then(res => {
      this.logger.verbose(`${isoCode} : Response status From Product ${res.status}`);
    }).catch(e => {
      this.logger.warn(`${isoCode} : RequestRegularUpdater Failed | ${e.message}`);
    });
  }

  private addKey<T>(data: T extends ProductApiData ? T : never): T {
    return (data.key = this.TEMP_KEY, data);
  }

  /**
   * Product API 리팩터링 하면서 삭제 예정
   */
  private convertToUpdateTuple(
    fulfilledYfPrice: FulfilledYfPrice
  ): UpdateTuple {
    return [
      fulfilledYfPrice.symbol,
      fulfilledYfPrice.regularMarketLastClose
    ];
  }

}

// Todo: interface

/**
 * Product API 리팩터링 하면서 삭제 예정
 */
type UpdateTuple = Readonly<[Ticker, number]>;

type updatePriceByExchangeData
= ProductApiData
& Readonly<{
  marketDate: MarketDate;
  priceArrs: UpdateTuple[];
}>;

// Todo: Refac - keyGuard
type ProductApiData = {
  key?: string; //
};