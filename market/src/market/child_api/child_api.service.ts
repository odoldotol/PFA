import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom, map } from 'rxjs';
import { Either } from "src/common/class/either";
import { 
  TResponseYfInfo,
  TResponseYfPrice,
  TExchangeSession,
  TFailure
} from './type';
import { 
  TYfInfo,
  TYfPrice
} from '../type';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from 'src/common/interface/environmentVariables.interface';
import { EnvKey } from 'src/common/enum/envKey.enum';
import { HttpService } from 'src/http/http.service';
import { 
  YFINANCE_INFO_URN,
  YFINANCE_PRICE_URN,
  EXCHANGE_SESSION_URN
} from './const';

@Injectable()
export class ChildApiService {

  private readonly logger = new Logger(ChildApiService.name);
  public readonly CONCURRENCY = this.configService.get(EnvKey.Child_concurrency, 1, { infer: true }) * 50;

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly httpService: HttpService
  ) {}

  public async fetchYfInfo(ticker: string) {
    return (await this.post<TResponseYfInfo>(YFINANCE_INFO_URN + ticker))
    .map(v => Object.assign(v.info, v.fastinfo, v.metadata, v.price) as TYfInfo);
  }

  public async fetchYfPrice(ticker: string) {
    return (await this.post<TResponseYfPrice>(YFINANCE_PRICE_URN + ticker))
    .map(v => Object.assign(v, { symbol: ticker }) as TYfPrice);
  }

  public fetchEcSession(ISO_Code: string) {
    return this.post<TExchangeSession>(EXCHANGE_SESSION_URN + ISO_Code);
  }

  // Todo: Refac
  private post<T>(url: string): Promise<Either<TFailure, T>> {
    return firstValueFrom(this.httpService.post(url).pipe(
      map(res => res.data),
      map(data => data.error ? Either.left(data.error) : Either.right(data))
    ));
  }

}
