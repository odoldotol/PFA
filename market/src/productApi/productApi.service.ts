import {
  Injectable,
  Logger
} from '@nestjs/common';
import { TempConfigService } from 'src/config';
import { HttpService } from '@nestjs/axios';
import {
  ExchangeCore,
  FulfilledYfPrice,
  MarketDate,
  PriceTuple
} from 'src/common/interface';
import { FINANCIALASSET_RENEW_PATH } from './const';
import { firstValueFrom } from 'rxjs';
import {
  intervalTryUntilResolvedOrTimeout,
  isHttpResponse4XX,
  joinSlash
} from 'src/common/util';

@Injectable()
export class ProductApiService {

  private readonly logger = new Logger(ProductApiService.name);
  private readonly TEMP_KEY = this.tempConfigSrv.getKey();

  constructor(
    private readonly tempConfigSrv: TempConfigService,
    private readonly httpService: HttpService,
  ) {}

  public async renewFinancialAssetExchange(
    exchange: ExchangeCore,
    updateResult: FulfilledYfPrice[]
  ): Promise<void> {
    const isoCode = exchange.isoCode;
    const data: RenewData = {
      marketDate: exchange.marketDate,
      priceArrs: updateResult.map(this.convertToPriceTuple)
    };

    const task = () => firstValueFrom(this.httpService.post(
      joinSlash(FINANCIALASSET_RENEW_PATH, isoCode),
      this.addKey(data)
    ));

    await intervalTryUntilResolvedOrTimeout(task, {
      interval: 1000,
      timeout: 1000 * 5,
      rejectCondition: isHttpResponse4XX
    })
    .then(res => this.logger.verbose(`${isoCode} : Response status From Product ${res.status}`))
    .catch(e => this.logger.warn(`${isoCode} : RequestRegularUpdater Failed | ${e.message}`));
  }

  /**
   * @todo 삭제
   */
  private addKey<T>(data: T extends ProductApiData ? T : never): T {
    return (data.key = this.TEMP_KEY, data);
  }

  /**
   * Product API 리팩터링 하면서 삭제 예정
   */
  private convertToPriceTuple(
    fulfilledYfPrice: FulfilledYfPrice
  ): PriceTuple {
    return [
      fulfilledYfPrice.symbol,
      fulfilledYfPrice.regularMarketLastClose,
      fulfilledYfPrice.regularMarketPreviousClose,
    ];
  }
}

type RenewData = ProductApiData & Readonly<{
  marketDate: MarketDate;
  priceArrs: PriceTuple[];
}>;

// Todo: Refac - keyGuard
type ProductApiData = {
  key?: string; //
};