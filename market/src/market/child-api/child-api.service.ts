import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom, map } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';
import { Either } from "@common/class/either.class";

@Injectable()
export class ChildApiService {

    private readonly logger = new Logger(ChildApiService.name);

    constructor(
        private httpService: HttpService) {}

    fetchYfInfo = (ticker: string) => this.post(`yf/info/${ticker}`);
    fetchYfPrice = (ticker: string) => this.post(`yf/price/${ticker}`);
    fetchEcSession = (ISO_Code: string) => this.post(`ec/session/${ISO_Code}`);

    post = (url: string, data?) => firstValueFrom(this.httpService.post(url, data).pipe(
        catchError((error: AxiosError) => {
            this.logger.error(error);
            throw error;}),
        map(res => res.data),
        map(data => data.error ? Either.left(data.error) : Either.right(data))));

}
