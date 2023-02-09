import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom } from 'rxjs';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { OkEcSession } from '../interfaces/ecSession.interface';
import { YfInfo } from '../interfaces/yfInfo.interface';
import { YfPrice } from '../interfaces/yfPrice.interface';

@Injectable()
export class MarketService {

    private readonly logger = new Logger(MarketService.name);
    // GETMARKET_URL 가 undefined 면 child_process 방식으로 동작함
    private readonly GETMARKET_URL = this.configService.get('GETMARKET_URL');
    private readonly PIP_COMMAND = this.configService.get('PIP_COMMAND');
    private readonly YFCCC_ISO_Code = this.configService.get('YahooFinance_CCC_ISO_Code');

    constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
        private readonly schedulerRegistry: SchedulerRegistry,
    ) {
        this.initiatePyLibChecker();
    }

    /**
     * ###
     */
    getInfoByTickerArr(tickerArr: string[]): Promise<YfInfo[]> {
        return this.getSomethingByTickerArr(tickerArr, "Info");
    }

    /**
     * 
     */
    getPriceByTickerArr(tickerArr: string[]): Promise<YfPrice[]> {
        return this.getSomethingByTickerArr(tickerArr, "Price");
    }

    /**
     * ### yahoo finance 에서 something 을 가져오기
     * - python 라이브러리 yfinance 사용
     */
    private async getSomethingByTickerArr(tickerArr: string[], something: "Info" | "Price") {
        try {
            const resultArr = [];
            // 하나의 프로세스가 2~10초정도 걸리기때문에 벙열처리필수 + result 에 담기는 순서가 보장되기를 바람
            await tickerArr.reduce(async (acc, ticker) => {
                let result: object;
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
    private async getEcSessionByISOcode(ISO_Code: string): Promise<OkEcSession> {
        try {
            if (this.GETMARKET_URL) { // getMarket 이용
                const marketSession = (await firstValueFrom(
                    this.httpService.get(`${this.GETMARKET_URL}ec/session?ISO_Code=${ISO_Code}`)
                    .pipe(catchError(error => {
                        throw error; //[Todo] 에러 핸들링
                    }))
                )).data;
                if (marketSession["error"]) {
                    console.log("ERROR: ", marketSession["error"])
                    throw marketSession["error"]
                };
                return marketSession;
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
     * ### ISO code 로 session 의 something 알아내기
     * - Yf_CCC 케이스 특이사항
     */
    async getMarketSessionByISOcode(ISO_Code: string): Promise<OkEcSession> {
        try {
            if (ISO_Code === this.YFCCC_ISO_Code) {
                const previous = new Date(
                    new Date().toISOString().slice(0, 10)/*+"T00:00:00.000Z"*/
                ).toISOString()
                const nextDate = new Date(previous)
                nextDate.setUTCDate(nextDate.getUTCDate() + 1)
                const next = nextDate.toISOString()
                return {
                    previous_open: previous,
                    previous_close: previous,
                    next_open: next,
                    next_close: next
                };
            }
            return this.getEcSessionByISOcode(ISO_Code)
        } catch (error) {
            throw error;
        }
    }

    /**
     * ### 세션 정보 로 장중이 아닌지 알아내기
     * - 장중이 아니면 true, 장중이면 false
     * - Yf_CCC 는 항상 true 반환중
     */
    isNotMarketOpen({previous_open, previous_close, next_open, next_close}: OkEcSession, ISO_Code: string) {
        try {
            // if (ISO_Code === "this.yfCCC_ISO_Code") { // 뭐가 옳은지, 뭐가 더 정확할지?
            //     return false;
            // };
            return new Date(previous_open) > new Date(previous_close) && new Date(next_open) > new Date(next_close)
            ? false : true
        } catch (error) {
            throw error;
        };
    }

    /**
     * ### 파이썬 ChildProcess 만들기
     */
    private getPyChildProcess(args: string[]): ChildProcessWithoutNullStreams {
        return spawn('python', args, {cwd: 'src/yahoofinance/py', timeout: 60000}); // 1분 제한
    }

    /**
     * ### ChildProcess 표준출력 받기
     * - 다양한 에러 반환
     * - 타임아웃 에러 반환
     */
    private getStdoutByChildProcess(cp: ChildProcessWithoutNullStreams): Promise<any> {
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
     * ### 파이썬 라이브러리 버젼 최신인지 확인
     * - yfinance
     * - exchange_calendars
     */
    private async isPyLibVerUptodate() {
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

    /**
     * ### PyLibChecker initiate
     */
    private async initiatePyLibChecker() {
        try {
            await this.isPyLibVerUptodate();
            try {
                this.logPyCronJob();
            } catch (error) {
                if (error.message.slice(0, 56) === `No Cron Job was found with the given name (pyLibChecker)`) {
                    const pyLibChecker = new CronJob("0 0 6 * * *", this.pyLibChecker.bind(this));
                    this.schedulerRegistry.addCronJob("pyLibChecker", pyLibChecker);
                    pyLibChecker.start();
                    /* logger */this.logger.log(`PyLibChecker : [New]scheduled ${(new Date(pyLibChecker.nextDate().toString())).toLocaleString()}`);
                } else {
                    /* logger */this.logger.error(error)
                }
            }
        } catch (error) {
            throw error;
        };
    }

    /**
     * ###
     */
    private async pyLibChecker() {
        try {
            await this.isPyLibVerUptodate();
            this.logPyCronJob();
        } catch (error) {
            throw error;
        }
    }

    /**
     * ###
     * - [Market]
     */
    private logPyCronJob() {
        try {
            const pyLibChecker = this.schedulerRegistry.getCronJob("pyLibChecker")
            /* logger */this.logger.log(`pyLibChecker : ${(new Date(pyLibChecker.nextDate().toString())).toLocaleString()}`);
        } catch (error) {
            throw error;
        }
    }

}
