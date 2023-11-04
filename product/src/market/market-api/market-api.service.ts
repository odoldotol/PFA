import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom, map } from 'rxjs';
import { AxiosError } from 'axios';
import {
    ALLEXCHANGES_URN,
    PRICEASSETS_BY_EXCHANGE_URN,
    PRICEASSET_BY_TICKER_URN
} from './const';

@Injectable()
export class MarketApiService {

    private readonly logger = new Logger(MarketApiService.name);

    constructor(
        private httpService: HttpService) {}

    fetchAllSpDoc = () => firstValueFrom(this.httpService.get(ALLEXCHANGES_URN).pipe(
        catchError(error => {
            this.logger.error(error);
            throw error;}),
        map(res => res.data as StatusPrice[])));

    fetchPriceByISOcode = (ISO_Code: string) => firstValueFrom(this.httpService.post(PRICEASSETS_BY_EXCHANGE_URN + ISO_Code).pipe(
        catchError((error: AxiosError) => {
            this.logger.error(error);
            throw error;}),
        map(res => res.data as PSet[])));

    fetchPriceByTicker = (ticker: string) => firstValueFrom(this.httpService.post(PRICEASSET_BY_TICKER_URN + ticker).pipe(
        catchError(error => {
            if (error.response?.data.error === "Bad Request") throw new BadRequestException(error.response.data);
            else if (error.response?.data.error === "Not Found") throw new NotFoundException(error.response.data);
            else if (error.response) throw new InternalServerErrorException(error.response.data);
            else throw new InternalServerErrorException(error);}),
        map(res => res.data as RequestedPrice)));

}
