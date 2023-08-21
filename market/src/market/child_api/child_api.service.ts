import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom, map } from 'rxjs';
import { AxiosError } from 'axios';
import { Either } from "src/common/class/either";
import { TYfAsset, TYfPrice, TExchangeSession, TChildApiFailure } from './type';

@Injectable()
export class ChildApiService {

  private readonly logger = new Logger(ChildApiService.name);

  constructor(
    private httpService: HttpService
  ) {}

  public fetchYfInfo(ticker: string) {
    return this.post<TYfAsset>(`yf/info/${ticker}`);
  }

  public fetchYfPrice(ticker: string) {
    return this.post<TYfPrice>(`yf/price/${ticker}`);
  }

  public fetchEcSession(ISO_Code: string) {
    return this.post<TExchangeSession>(`ec/session/${ISO_Code}`);
  }

  // Todo: Refac
  private post<T>(url: string): Promise<Either<TChildApiFailure, T>> {
    return firstValueFrom(this.httpService.post(url).pipe(
      catchError((error: AxiosError) => {
        this.logger.error(error);
        throw error;
      }),
      map(res => res.data),
      map(data => data.error ? Either.left(data.error) : Either.right(data))
    ));
  }

}
