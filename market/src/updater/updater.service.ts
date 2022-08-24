import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { Yf_info, Yf_infoDocument } from 'src/schema/yf_info.schema';
// import isEqual from 'lodash.isequal';

@Injectable()
export class UpdaterService {

    constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
        @InjectModel(Yf_info.name) private yf_infoModel: Model<Yf_infoDocument>
    ) {}

    async getPriceByTickerArr(tickerArr: string[]): Promise<object[]> {
        return (await firstValueFrom(this.httpService.post(`${this.configService.get('GETMARKET_URL')}yf/price`, tickerArr))).data;
    }
    
    async updatePriceByTickerArr(tickerArr: string[]) {
        // 가격 배열 가져오기
        const priceArr = await this.getPriceByTickerArr(tickerArr);

        // 디비 업데이트
        let result = {success: [], failure: []};
        let updatePromiseArr = tickerArr.map((ticker, idx) => {
            if (priceArr[idx]["error"]) {result.failure.push(priceArr[idx]);}
            else {
                return this.yf_infoModel.updateOne({ symbol: ticker }, { regularMarketPrice: priceArr[idx] }).exec()
                    .then((res)=>{
                        // const successRes = {
                        //     acknowledged: true,
                        //     modifiedCount: 1,
                        //     upsertedId: null,
                        //     upsertedCount: 0,
                        //     matchedCount: 1
                        // }
                        if (
                            res.acknowledged &&
                            res.modifiedCount === 1 &&
                            res.upsertedId === null &&
                            res.upsertedCount === 0 &&
                            res.matchedCount === 1
                            ) /* 예외 케이스가 발견됨에 따라 수정해야항 수도 있음 */ {
                            result.success.push(ticker);
                        } else {
                            result.failure.push(ticker, res);
                        }
                    })
                    .catch((err)=>{
                        // console.log(err);
                        result.failure.push({ticker, err});
                    })
            }
        })
        await Promise.all(updatePromiseArr);
        return result;
    }

    async updatePriceByOption(option, optionArr) {

    }

    // async updatePriceAll(each: number) {
    //     this.getPriceByTickerList([]);
    //     return each;
    // }
}
