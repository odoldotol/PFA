import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { TUpdateTuple } from 'src/common/type';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from 'src/common/interface/environmentVariables.interface';
import { EnvKey } from 'src/common/enum';
import { HttpService } from 'src/http/http.service';

@Injectable()
export class ProductApiService {

  private readonly logger = new Logger(ProductApiService.name);
  private readonly TEMP_KEY = this.configService.get(EnvKey.TempKey, 'TEMP_KEY', { infer: true });

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly httpService: HttpService,
  ) {}

  public async updatePriceByExchange(
    ISO_Code: string,
    data: { marketDate: string, priceArrs: TUpdateTuple[] } // Todo: type
  ) {
    // @ts-ignore // Todo: 인증,권한 구현하기
    const addKey = <T>(body: T) => (body["key"] = this.TEMP_KEY, body);

    await this.httpService.tryUntilResolved(
      1000,
      1000 * 5,
      () => firstValueFrom(this.httpService.post(`api/v1/market/update/price/exchange/${ISO_Code}`, addKey(data)))
    ).then(res => {
      this.logger.verbose(`${ISO_Code} : Response status From Product ${res.status}`);
    }).catch(e => {
      this.logger.warn(`${ISO_Code} : RequestRegularUpdater Failed | ${e.message}`);
    });
  }

}
