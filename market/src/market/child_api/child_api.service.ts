import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom, map } from 'rxjs';
import { Either } from "src/common/class/either";
import { 
  TResponseYfInfo,
  TResponseYfPrice,
  TExchangeSession,
  TFailure } from './type';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from 'src/common/interface/environmentVariables.interface';
import { EnvKey } from 'src/common/enum/envKey.enum';
import { HttpService } from 'src/http/http.service';

@Injectable()
export class ChildApiService {

  private readonly logger = new Logger(ChildApiService.name);
  public readonly CONCURRENCY = this.configService.get(EnvKey.Child_concurrency, 1, { infer: true }) * 50;

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly httpService: HttpService
  ) {}

  public fetchYfInfo(ticker: string) {
    return this.post<TResponseYfInfo>(`yf/info/${ticker}`);
  }

  public fetchYfPrice(ticker: string) {
    return this.post<TResponseYfPrice>(`yf/price/${ticker}`);
  }

  public fetchEcSession(ISO_Code: string) {
    return this.post<TExchangeSession>(`ec/session/${ISO_Code}`);
  }

  // Todo: Refac
  private post<T>(url: string): Promise<Either<TFailure, T>> {
    return firstValueFrom(this.httpService.post(url).pipe(
      map(res => res.data),
      map(data => data.error ? Either.left(data.error) : Either.right(data))
    ));
  }

}
