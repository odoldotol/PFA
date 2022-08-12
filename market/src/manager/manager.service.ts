import { Injectable } from '@nestjs/common';

@Injectable()
export class ManagerService {

    async getInfoByTickerList(tickerList: string[]) {
        return tickerList;
    }

    async createByTickerList(tickerList: string[]) {
        let priceList = await this.getInfoByTickerList(tickerList);
        return tickerList;
    }

    async updateByTickerList(tickerList: string[]) {
        return tickerList;
    }

    async deleteByTickerList(tickerList: string[]) {
        return tickerList;
    }
}
