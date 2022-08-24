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

    async getInfoByTickerArr(tickerArr: string[]): Promise<object[]> {
        return (await firstValueFrom(this.httpService.post(`${this.configService.get('GETMARKET_URL')}yf/info`, tickerArr))).data;
    }

    async createByTickerArr(tickerArr: string[]) {
        let infoArr = await this.getInfoByTickerArr(tickerArr);
        
        // const resultArr = infoArr.map(async <T>(info: T) => {
        //     try {
        //         if (info["error"]) {return info;}
        //         else {
        //             const newInfo = new this.yf_infoModel(info);
        //             await newInfo.save();
        //             return newInfo;
        //         }
        //     } catch(err) {
        //         info["create_error"] = err;
        //         return info;
        //     }
        // })
        // return await Promise.all(resultArr);

        let result = {success: [], failure: []};
        let insertArr = [];
        infoArr.forEach((info)=>{
            if (info["error"]) {result.failure.push(info);}
            else {insertArr.push(info);}
        })
        await this.yf_infoModel.insertMany(insertArr, {
            ordered: false,
            limit: 100
        })
        .then((res)=>{
            result.success = res;
        })
        .catch((err)=>{ // 몽고 에러 응답에서 아래 키들이 사라질리는 없을것 같음. 응답 형태를 보니 중복 부분이 있는걸로 보아 개선해도 아마 삭제하지는 않는것같음.
            result.failure = result.failure.concat(err.writeErrors);
            result.success = result.success.concat(err.insertedDocs);
        })
        return result;
    }

    async updateByTickerArr(tickerArr: string[]) {
        return [];
    }

    async deleteByTickerArr(tickerArr: string[]) {
        return [];
    }
}
