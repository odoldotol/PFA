import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { spawn } from 'child_process';
import isoToYfTimezone from './isoToYfTimezone';

@Injectable()
export class YahoofinanceService {

    constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
    ) {}

    /**
     * ### yahoo finance 에서 자산정보 가져오기
     * - python 라이브러리 yfinance 사용
     */
    async getInfoByTickerArr(tickerArr: string[]): Promise<object[]> {
        // fastAPI 서버에 요청
        // try {
        //    return (await firstValueFrom(this.httpService.post(`${this.configService.get('GETMARKET_URL')}yf/info`, tickerArr))).data;
        // } catch(err) {
        //     throw new InternalServerErrorException(err)
        // };

        const result = [];
        // 하나의 프로세스가 10초정도 걸리기때문에 벙열처리필수 + result 에 담기는 순서가 보장되기를 바람
        await tickerArr.reduce(async (acc, ticker) => {
            // childProcess
            const cp = spawn('python3', ['getInfoByTicker.py', ticker], {cwd: 'src/yahoofinance'}) // 주의(절대경로 src)
            const info = await new Promise(resolve => {
                cp.stdout.on('data', (data) => {
                    resolve(JSON.parse(data.toString()));
                })
            })
            // 에러처리
            cp.on('error', (err) => {
                throw new InternalServerErrorException(err)
            })

            // 이전순서 대기
            await acc
            // info 를 기다리는 프로미스
            return new Promise(resolve => {
                result.push(info);
                resolve();
            })
        }, Promise.resolve())

        return result;
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

    /**
     * ### ISO code 를 yahoofinance exchangeTimezoneName 로 변환 혹은 그 반대를 수행
     */
    isoToYfTimezone(code: string): string | undefined {
        return isoToYfTimezone[code];
    }
}
