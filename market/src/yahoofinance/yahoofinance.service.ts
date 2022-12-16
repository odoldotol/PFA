import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class YahoofinanceService {

    constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
    ) {}

    /**
     * ### yf 서버에 info 요청하기
     */
    async getInfoByTickerArr(tickerArr: string[]): Promise<object[]> {
        try {
            return (await firstValueFrom(this.httpService.post(`${this.configService.get('GETMARKET_URL')}yf/info`, tickerArr))).data;
        } catch(err) {
            throw new InternalServerErrorException(err)
        };
    }

    /**
     * ### yf 서버에 price 요청하기
     */
    async getPriceByTickerArr(tickerArr: string[]): Promise<object[]> {
        try {
            return (await firstValueFrom(this.httpService.post(`${this.configService.get('GETMARKET_URL')}yf/price`, tickerArr))).data;
        } catch(err) {
            throw new InternalServerErrorException(err)
        };
    }
}
