import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { Yf_info, Yf_infoDocument } from '../schema/yf_info.schema';

@Injectable()
export class ManagerService {

    constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
        @InjectModel(Yf_info.name) private yf_infoModel: Model<Yf_infoDocument>
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
