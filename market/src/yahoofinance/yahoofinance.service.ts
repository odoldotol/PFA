// import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { firstValueFrom } from 'rxjs';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import isoToYfTimezone from './isoToYfTimezone';

@Injectable()
export class YahoofinanceService {

    constructor(
        // private readonly configService: ConfigService,
        // private readonly httpService: HttpService,
    ) {}

    /**
     * ### yahoo finance 에서 something 을 가져오기
     * - python 라이브러리 yfinance 사용
     */
    async getSomethingByTickerArr(tickerArr: string[], something: "Info" | "Price"): Promise<object[]> {
        const resultArr = [];
        // 하나의 프로세스가 2~10초정도 걸리기때문에 벙열처리필수 + result 에 담기는 순서가 보장되기를 바람
        await tickerArr.reduce(async (acc, ticker) => {
            const cp = this.getPyChildProcess([`get${something}ByTicker.py`, ticker]);
            const result = await this.getStdoutByChildProcess(cp)
                .then(res => res)
                .catch(error => {return {error: error}});
            await acc; // 이전순서 result 대기
            return new Promise(resolve => { // result 를 기다리는 프로미스
                resultArr.push(result);
                resolve();
            });
        }, Promise.resolve());
        return resultArr;
    }

    /**
     * ### ISO code 로 거래소 세션 정보읽기
     * - python 라이브러리 exchange_calendars 사용
     */
    async getMarketSessionByISOcode(ISO_Code: string) {
        const cp = this.getPyChildProcess(['getSessionByISOcode.py', ISO_Code]);
        const result = await this.getStdoutByChildProcess(cp);
        return result;
    }

    /**
     * ### 파이썬 ChildProcess 만들기
     */
    getPyChildProcess(args: string[]): ChildProcessWithoutNullStreams {
        return spawn('python3', args, {cwd: 'src/yahoofinance', timeout: 6000}); // 1분 제한
    }

    /**
     * ### ChildProcess 표준출력 받기
     * - 다양한 에러 반환
     * - 타임아웃 에러 반환
     */
    getStdoutByChildProcess(cp: ChildProcessWithoutNullStreams): Promise<any> {
        return new Promise((resolve, reject) => {
            cp.stdout.on('data', (data) => {
                resolve(JSON.parse(data.toString()));
            })
            cp.on('error', (err) => {
                reject(new InternalServerErrorException(err))
            });
            cp.stderr.on('data', (data) => {
                reject(new InternalServerErrorException(JSON.parse(data.toString())))
            });
            cp.on('close', (code, signal) => {
                if (code === null && signal === "SIGTERM") { // timeout
                    reject(new InternalServerErrorException({msg: "ChildProcess closed by Timeout!", code, signal}))
                }
            });
        });
    }

    /**
     * ### yahoo finance 에서 자산정보 가져오기
     */
    // async getInfoByTickerArr(tickerArr: string[]): Promise<object[]> {
    //     // fastAPI 서버에 요청
    //     try {
    //        return (await firstValueFrom(this.httpService.post(`${this.configService.get('GETMARKET_URL')}yf/info`, tickerArr))).data;
    //     } catch(err) {
    //         throw new InternalServerErrorException(err)
    //     };
    // }

    /**
     * ### yahoo finance 에서 자산의 가격정보 가져오기
     */
    // async getPriceByTickerArr(tickerArr: string[]): Promise<object[]> {
    //     // fastAPI 서버에 요청
    //     try {
    //         return (await firstValueFrom(this.httpService.post(`${this.configService.get('GETMARKET_URL')}yf/price`, tickerArr))).data;
    //     } catch(err) {
    //         throw new InternalServerErrorException(err)
    //     };
    // }

    /**
     * ### ISO code 를 yahoofinance exchangeTimezoneName 로 변환 혹은 그 반대를 수행
     */
    isoToYfTimezone(code: string): string | undefined {
        return isoToYfTimezone[code];
    }
}
