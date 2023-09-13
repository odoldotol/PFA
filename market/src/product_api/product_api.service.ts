import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom, map } from 'rxjs';
import { AxiosError } from 'axios';
import { TUpdateTuple } from 'src/common/type';
import { ConnectionService } from './connection.service';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from 'src/common/interface/environmentVariables.interface';
import { EnvKey } from 'src/common/enum';

@Injectable()
export class ProductApiService {

  private readonly logger = new Logger(ProductApiService.name);
  private readonly TEMP_KEY = this.configService.get(EnvKey.TempKey, 'TEMP_KEY', { infer: true });

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly httpService: HttpService,
    private readonly connectionSrv: ConnectionService
  ) {}

  public async updatePriceByExchange(
    ISO_Code: string,
    data: { marketDate: string, priceArrs: TUpdateTuple[] } // Todo: type
  ) {

    // @ts-ignore
    const addKey = <T>(body: T) => (body["key"] = this.TEMP_KEY, body);

    const ttt = () => firstValueFrom(this.httpService.post(`api/v1/market/update/price/exchange/${ISO_Code}`, addKey(data)).pipe(
      catchError((error: AxiosError) => {
        this.logger.error(error);
        throw error
      }),
      map(res => res.status)
    ));

    try {
      const resStatCode = await ttt();
      this.logger.verbose(`${ISO_Code} : Response status From Product ${resStatCode}`);
    } catch (error) {
      this.logger.error(error);
      const retryDate = new Date();
      retryDate.setMinutes(retryDate.getMinutes() + 5);
      setTimeout(async () => {
        try {
          const resStatCode = await ttt();
          this.logger.verbose(`${ISO_Code} : RegularUpdater Product Response status ${resStatCode}`);
        } catch (error) {
          this.logger.error(error);
          this.logger.warn(`${ISO_Code} : RequestRegularUpdater Failed`);
        }
      }, 1000 * 60 * 5);
      this.logger.warn(`${ISO_Code} : Retry RequestRegularUpdater after 5 Min. ${retryDate.toLocaleString()}`);
    }
  }

}
