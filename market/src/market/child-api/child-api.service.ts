import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom, map } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';
import { Either } from "src/common/class/either";

@Injectable()
export class ChildApiService {

    private readonly logger = new Logger(ChildApiService.name);

    constructor(
        private httpService: HttpService) {}

    fetchYfInfo = (ticker: string) => this.post(`yf/info/${ticker}`) as Promise<Either<YfInfoError, GetMarketInfo>>;
    fetchYfPrice = (ticker: string) => this.post(`yf/price/${ticker}`) as Promise<Either<YfPriceError, YfPrice>>;
    fetchEcSession = (ISO_Code: string) => this.post(`ec/session/${ISO_Code}`) as Promise<Either<ExchangeSessionError, ExchangeSession>>;

    post = (url: string) => firstValueFrom(this.httpService.post(url).pipe(
        catchError((error: AxiosError) => {
            this.logger.error(error);
            throw error;}),
        map(res => res.data),
        map(data => data.error ? Either.left(data.error) : Either.right(data))));

}
