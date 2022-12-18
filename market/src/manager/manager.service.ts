import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Yf_info, Yf_infoDocument } from '../mongodb/schema/yf_info.schema';
import { YahoofinanceService } from 'src/yahoofinance/yahoofinance.service';
import { Status_price, Status_priceDocument } from 'src/mongodb/schema/status_price.schema';

@Injectable()
export class ManagerService {

    constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
        @InjectModel(Yf_info.name) private yf_infoModel: Model<Yf_infoDocument>,
        @InjectModel(Status_price.name) private status_priceModel: Model<Status_priceDocument>,
        private readonly yahoofinanceService: YahoofinanceService,
    ) {}

    /**
     * ### mongoDB 에 신규 자산 생성하기
     */
    async createByTickerArr(tickerArr: string[]) {
        let result = {success: [], failure: []}; // 응답

        // info 가져오기
        let infoArr = await this.yahoofinanceService.getInfoByTickerArr(tickerArr);
        // info 분류 (성공,실패)
        let insertArr = [];
        infoArr.forEach((info)=>{
            if (info["error"]) {result.failure.push(info);}
            else {insertArr.push(info);}
        });
        // mongoDB 에 저장
        await this.yf_infoModel.insertMany(insertArr, {
            ordered: false, // 오류발견해도 중지하지말고 전부 삽입하고 나중에 보고
            // limit: 100
        })
        .then((res)=>{
            result.success = res;
            // 신규 exchange 발견시 추가하기
            // this.status_priceModel.exists({ exchange: })
        })
        .catch((err)=>{
            result.failure = result.failure.concat(err.writeErrors);
            result.success = result.success.concat(err.insertedDocs);
            // 신규 exchange 발견시 추가하기
        })
        return result;
    }

    // async updateByTickerArr(tickerArr: string[]) {
    //     return [];
    // }

    // async deleteByTickerArr(tickerArr: string[]) {
    //     return [];
    // }
}
