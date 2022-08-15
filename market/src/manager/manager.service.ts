import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ManagerService {

    constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService
    ) {}

    async getInfoByTickerList(tickerArr: string[]) {
        const result = await firstValueFrom(this.httpService.post(`${this.configService.get('GETMARKET_URL')}yf/info`, tickerArr))
        return result.data;
    }

    async createByTickerList(tickerArr: string[]) {
        let infoArr = await this.getInfoByTickerList(tickerArr);
        return [];
    }

    async updateByTickerList(tickerArr: string[]) {
        return [];
    }

    async deleteByTickerList(tickerArr: string[]) {
        return [];
    }
}
