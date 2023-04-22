import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom, map } from 'rxjs';
import { AxiosError } from 'axios';


@Injectable()
export class ProductApiService {

    private readonly logger = new Logger(ProductApiService.name);

    constructor(
        private httpService: HttpService) {}
    
    updatePriceByExchange = (
        ISO_Code: string,
        data: { marketDate: string, priceArrs: [string, number][] }
    ) => firstValueFrom(this.httpService.post(`api/v1/market/update/price/exchange/${ISO_Code}`, data).pipe(
        catchError((error: AxiosError) => {
            this.logger.error(error);
            throw error}),
        map(res => res.status)));

}
