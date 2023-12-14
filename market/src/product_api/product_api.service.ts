import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from 'src/http/http.service';
import {
  EnvironmentVariables,
  CoreExchange,
  UpdateTuple
} from 'src/common/interface';
import { EnvKey } from 'src/common/enum';
import { UPDATE_PRICE_BY_EXCHANGE_URN } from './const';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ProductApiService {

  private readonly logger = new Logger(ProductApiService.name);
  private readonly TEMP_KEY = this.configService.get(
    EnvKey.TEMP_KEY,
    'TEMP_KEY',
    { infer: true }
  );

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly httpService: HttpService,
  ) {}

  public async updatePriceByExchange(
    exchange: CoreExchange,
    updateTupleArr: UpdateTuple[]
  ) {
    // @ts-ignore // Todo: 인증,권한 구현하기
    const addKey = <T>(body: T) => (body["key"] = this.TEMP_KEY, body);

    const isoCode = exchange.isoCode;
    const data = { marketDate: exchange.marketDate, priceArrs: updateTupleArr } // Todo: type

    await this.httpService.tryUntilResolved(
      1000,
      1000 * 5,
      () => firstValueFrom(this.httpService.post(
        UPDATE_PRICE_BY_EXCHANGE_URN + isoCode,
        addKey(data)
      ))
    ).then(res => {
      this.logger.verbose(`${isoCode} : Response status From Product ${res.status}`);
    }).catch(e => {
      this.logger.warn(`${isoCode} : RequestRegularUpdater Failed | ${e.message}`);
    });
  }

}
