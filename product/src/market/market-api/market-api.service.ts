import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom, map } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class MarketApiService {

    private readonly logger = new Logger(MarketApiService.name);

    constructor(
        private httpService: HttpService) {}

    fetchAllSpDoc = () => firstValueFrom(this.httpService.get(`api/v1/dev/status_price/info`).pipe(
        catchError(error => {
            this.logger.error(error);
            throw error;}),
        map(res => res.data as StatusPrice[])));

    fetchPriceByISOcode = (ISO_Code: string) => firstValueFrom(this.httpService.post(`api/v1/price/exchange/${ISO_Code}`).pipe(
        catchError((error: AxiosError) => {
            this.logger.error(error);
            throw error;}),
        map(res => res.data as PSet2[])));

    fetchPriceByTicker = (ticker: string) => firstValueFrom(this.httpService.post(`api/v1/price/ticker/${ticker}`).pipe(
        catchError(error => {
            if (error.response?.data.error === "Bad Request") throw new BadRequestException(error.response.data);
            else if (error.response) throw new InternalServerErrorException(error.response.data);
            else throw new InternalServerErrorException(error);}),
        map(res => res.data as RequestedPrice)));

}
