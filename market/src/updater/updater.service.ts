import { Injectable } from '@nestjs/common';

@Injectable()
export class UpdaterService {

    async updatePriceAll(each: number) {
        this.getPriceByTickerList([]);
        return each;
    }

    async updatePriceByTickerList(tickerList: string[]) {
        this.getPriceByTickerList(tickerList);
        return tickerList;
    }

    async getPriceByTickerList(tickerList: string[]) {
        return tickerList;
    }
}
