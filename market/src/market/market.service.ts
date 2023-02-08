import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER, Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom } from 'rxjs';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { Cache } from 'cache-manager';
import { Config_exchangeRepository } from '../database/mongodb/repository/config_exchane.repository';

@Injectable()
export class MarketService {

    // GETMARKET_URL 가 undefined 면 child_process 방식으로 동작함
    private readonly GETMARKET_URL = this.configService.get('GETMARKET_URL');
    private readonly PIP_COMMAND = this.configService.get('PIP_COMMAND');
    private readonly logger = new Logger(MarketService.name);

    constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private readonly config_exchangeRepository: Config_exchangeRepository,
    ) {}

    /**
     * ### yahoo finance 에서 something 을 가져오기
     * - python 라이브러리 yfinance 사용
     */
    async getSomethingByTickerArr(tickerArr: string[], something: "Info" | "Price"): Promise<object[]> {
        try {
            const resultArr = [];
            // 하나의 프로세스가 2~10초정도 걸리기때문에 벙열처리필수 + result 에 담기는 순서가 보장되기를 바람
            await tickerArr.reduce(async (acc, ticker) => {
                let result
                if (this.GETMARKET_URL) { // getMarket 이용
                    result = (await firstValueFrom(
                        this.httpService.get(`${this.GETMARKET_URL}yf/${something.toLowerCase()}?ticker=${ticker}`)
                        .pipe(catchError(error => {
                            throw error; //[Todo] 에러 핸들링
                        }))
                    )).data;
                } else { // child_process 이용
                    const cp = this.getPyChildProcess([`get${something}ByTicker.py`, ticker]);
                    result = await this.getStdoutByChildProcess(cp)
                        .then(res => res)
                        .catch(error => {return {error: error}});
                };
                await acc; // 이전순서 result 대기
                return new Promise(resolve => { // result 를 기다리는 프로미스
                    resultArr.push(result);
                    resolve();
                });
            }, Promise.resolve());
            return resultArr;
        } catch (error) {
            throw error;
        };
    }

    /**
     * ### ISO code 로 거래소 세션 정보읽기
     * - python 라이브러리 exchange_calendars 사용
     */
    async getMarketSessionByISOcode(ISO_Code: string) {
        try {
            if (this.GETMARKET_URL) { // getMarket 이용
                return (await firstValueFrom(
                    this.httpService.get(`${this.GETMARKET_URL}ec/session?ISO_Code=${ISO_Code}`)
                    .pipe(catchError(error => {
                        throw error; //[Todo] 에러 핸들링
                    }))
                )).data;
            } else { // child_process 이용
                const cp = this.getPyChildProcess(['getSessionByISOcode.py', ISO_Code]);
                return await this.getStdoutByChildProcess(cp)
                    .then(res => res)
                    .catch(error => {return {error: error}});
            };
        } catch (error) {
            throw error;
        };
    }

    /**
     * ### 파이썬 ChildProcess 만들기
     */
    getPyChildProcess(args: string[]): ChildProcessWithoutNullStreams {
        return spawn('python', args, {cwd: 'src/yahoofinance/py', timeout: 60000}); // 1분 제한
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
                reject(new InternalServerErrorException(data.toString()))
            });
            cp.on('close', (code, signal) => {
                // console.log(`ChildProcess closed with code: ${code} and signal: ${signal}`);
                if (code === null && signal === "SIGTERM") { // timeout
                    // console.log("ChildProcess closed by Timeout!");
                    reject(new InternalServerErrorException({msg: "ChildProcess closed by Timeout!", code, signal}))
                }
            });
        });
    }

    /**
     * isoCodeToTimezone 갱신
     */
    async setIsoCodeToTimezone() {
        try {
            await Promise.all((await this.config_exchangeRepository.findAllIsoCodeAndTimezone()).map(async isoCodeAndTimezone => {
                await this.cacheManager.set(isoCodeAndTimezone.ISO_Code, isoCodeAndTimezone.ISO_TimezoneName);
                await this.cacheManager.set(isoCodeAndTimezone.ISO_TimezoneName, isoCodeAndTimezone.ISO_Code);
            }));
        } catch (error) {
            throw error;
        };
    }

    /**
     * ### ISO code 를 yahoofinance exchangeTimezoneName 로 변환 혹은 그 반대를 수행
     * - 없으면 전체 갱신후 재시도
     */
    async isoCodeToTimezone(something: string): Promise<string> {
        try {
            const result: string = await this.cacheManager.get(something);
            if (!result) {
                await this.setIsoCodeToTimezone();
                return await this.cacheManager.get(something);
            };
            return result;
        } catch (error) {
            throw error;
        };
    }

    /**
     * ### 파이썬 라이브러리 버젼 최신인지 확인
     * - yfinance
     * - exchange_calendars
     */
    async isPyLibVerUptodate() {
        return new Promise<void>((resolve, reject) => {
            const result = {yfinance: "OutDated!!!", exchange_calendars: "OutDated!!!"};
            const cp = spawn(`${this.PIP_COMMAND}`, ['list', '--uptodate'], {timeout: 60000})
            cp.stdout.on('data', (data) => {
                const str = data.toString();
                if (/yfinance/.test(str)) {
                    result.yfinance = "UpToDate";
                };
                if (/exchange-calendars/.test(str)) {
                    result.exchange_calendars = "UpToDate";
                };
            });
            cp.on('error', (err) => {
                this.logger.error(err);
            });
            cp.stderr.on('data', (data) => {
                this.logger.error(data.toString());
            });
            cp.on('close', (code, signal) => {
                if (code === 0 && signal === null) { // success
                        this.logger.verbose(`yfinance : ${result.yfinance}`);
                        this.logger.verbose(`exchange_calendars : ${result.exchange_calendars}`);
                        resolve();
                } else if (code === null && signal === "SIGTERM") { // timeout
                    this.logger.warn(`PyLibVerChecker is closed by Timeout!\nCode: ${code}\nSignal: ${signal}`);
                    reject();
                } else {
                    this.logger.warn(`PyLibVerChecker is closed with code: ${code} and signal: ${signal}`);
                    reject();
                };
            });
        });
    }

}
