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
        let updatePromiseArr = tickerArr.map((ticker, idx) => { // map 의 콜백함수를 비동기 함수로 변환하면 void 함수로 만들어도 promise.all 에서 기다리면서 처리가 된다
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
                            result.failure.push({error: "updateOne error", ticker, res});
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

    async updatePriceByFilters(filterArr: object[]) {
        // db 에서 각 filter 들로 find 한 documents 들의 symbol 배열들을 만들어서 각각 updatePriceByTickerArr(symbol배열) 을 실행시켜!
        return Promise.all(filterArr.map(async (filter) => {
            return await this.yf_infoModel.find(filter, 'symbol').exec()
                .then(async (res) => {
                    const symbolArr = res.map(ele=>ele.symbol) // await this.updatePriceByTickerArr(res.map(ele=>ele.symbol)); <- 요로케 하면 안되요! // 내가 그냥 함수를 넣어버린게 되는건가? 그렇다면, 즉시실행함수형태로 하면 될거같은데?
                    return await this.updatePriceByTickerArr(symbolArr);
                })
                .catch((err) => {
                    // console.log(err);
                    return {findError: err};
                })
        }))
    }

    // async updatePriceAll(each: number) {
    //     this.getPriceByTickerList([]);
    //     return each;
    // }
}
