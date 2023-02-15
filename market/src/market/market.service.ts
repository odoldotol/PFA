import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom } from 'rxjs';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { pipe, map, toArray, toAsync, curry, concurrent } from "@fxts/core";
import { Either } from "../monad/either";

@Injectable()
export class MarketService {

    private readonly logger = new Logger(MarketService.name);
    private readonly GETMARKET_URL = this.configService.get('GETMARKET_URL');
    private readonly GETMARKET_CONCURRENCY: number = this.configService.get('GETMARKET_CONCURRENCY');
    private readonly PIP_COMMAND = this.configService.get('PIP_COMMAND');
    private readonly YFCCC_ISO_Code = this.configService.get('YahooFinance_CCC_ISO_Code');

    constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
        private readonly schedulerRegistry: SchedulerRegistry,
    ) {
        this.pyLibChecker();
    }

    /**
     * ### getInfoByTicker
     */
    getInfoByTicker = (ticker: string): Promise<Either<YfInfoError, YfInfo>> => this.getSomethingByTicker("Info", ticker);

    /**
     * ### getPriceByTicker
     */
    getPriceByTicker = (ticker: string): Promise<Either<YfPriceError, YfPrice>> => this.getSomethingByTicker("Price", ticker);

    /**
     * ### getInfoByTickerArr
     */
    getInfoByTickerArr = (tickerArr: string[]): Promise<Either<YfInfoError, YfInfo>[]> => this.asyncMapPipe(tickerArr, this.getSomethingByTicker("Info"), this.GETMARKET_CONCURRENCY);

    /**
     * ### getPriceByTickerArr
     */
    getPriceByTickerArr = (tickerArr: string[]): Promise<Either<YfPriceError, YfPrice>[]> => this.asyncMapPipe(tickerArr, this.getSomethingByTicker("Price"), this.GETMARKET_CONCURRENCY);

    /**
     * ### string 배열에 비동기작업을 map 병열수행
     */
    private asyncMapPipe = <T>(arr: string[], func: (a:string)=>Promise<T>, ccLen: number) => pipe(
        arr,
        toAsync,
        map(func),
        concurrent(ccLen),
        toArray
    );

    /**
     * ### getSomethingByTicker
     */
    private getSomethingByTicker = curry(async (something: string, ticker: string) => {
        const res = await this.getMarketOrCp(
            `${this.GETMARKET_URL}yf/${something.toLowerCase()}?ticker=${ticker}`,
            [`get${something}ByTicker.py`, ticker]
        );
        if (res.error) return Either.left(res.error);
        if (res.info && res.fastinfo && res.metadata && res.price)
            return Either.right(Object.assign(res.info, res.fastinfo, res.metadata, res.price));
        res['symbol'] = ticker;
        return Either.right(res);
    });

    /**
     * ### 세션 정보 로 장중이 아닌지 알아내기
     * 장중이 아니면 true, 장중이면 false
     * - ExchangeSession 또는 ISO_Code 를 인자로 받는다.
     */
    isNotMarketOpen = async (prop: ExchangeSession|string) => {
        let previous_open: string, previous_close: string, next_open: string, next_close: string;
        typeof prop === `string` ?
        ({previous_open, previous_close, next_open, next_close} = (await this.getExchangeSessionByISOcode(prop)).getRightOrThrowCustomError(InternalServerErrorException))
        : ({previous_open, previous_close, next_open, next_close} = prop);
        return new Date(previous_open) > new Date(previous_close) && new Date(next_open) > new Date(next_close) ? false : true;
    }
    

    /**
     * ### ISO code 로 거래소 세션 정보읽기
     * - Yf_CCC 케이스 특이사항
     */
    getExchangeSessionByISOcode = async (ISO_Code: string): Promise<Either<ExchangeSessionError, ExchangeSession>> => {
        if (ISO_Code === this.YFCCC_ISO_Code) {
            const previous = new Date(
                new Date().toISOString().slice(0, 10) // + "T00:00:00.000Z"
            ).toISOString();
            const nextDate = new Date(previous);
            nextDate.setUTCDate(nextDate.getUTCDate() + 1);
            const next = nextDate.toISOString();
            return Either.right({
                previous_open: previous,
                previous_close: previous,
                next_open: next,
                next_close: next
            });
        }
        const res = await this.getMarketOrCp(
            `${this.GETMARKET_URL}ec/session?ISO_Code=${ISO_Code}`,
            ['getSessionByISOcode.py', ISO_Code]
        );
        if (res.error) return Either.left(res.error);
        return Either.right(res);
    }

    /**
     * ###
     * - getMarket 서버를 이용할 수 없을 경우 자식 프로세스에서 시도한다.
     */
    private getMarketOrCp = (url: string, pyCpArgs: string[]) => firstValueFrom(
        this.httpService.get(url)
        .pipe(catchError(error => {
            throw error; //[Todo] 에러 핸들링
        }))
    ).catch(error => { // 실패시 자식프로세스에서 시도
        this.logger.error(error);
        return this.runPyCp(pyCpArgs);
    }).then(res => res.data);

    /**
     * ### runCp
     */
    private runPyCp = ([fileName, arg]: string[]) =>
    ({ data: this.getStdoutByChildProcess(this.getPyChildProcess([fileName, arg])) });

    /**
     * ### 파이썬 ChildProcess 만들기
     */
    private getPyChildProcess = (args: string[]): ChildProcessWithoutNullStreams => spawn('python', args, {cwd: 'src/market/py', timeout: 60000}); // 1분 제한

    /**
     * ### ChildProcess 표준출력 받기
     * - 다양한 에러 반환
     * - 타임아웃 에러 반환
     */
    private getStdoutByChildProcess = (cp: ChildProcessWithoutNullStreams) => new Promise(
        (resolve, reject) => {
            const stack: Array<Buffer|string> = [];
            cp.stdout.on('data', data => stack.push(data));
            cp.on('error', err => reject(new InternalServerErrorException(err)));
            cp.stderr.on('data', data => reject(new InternalServerErrorException(data.toString())));
            cp.on('close', (code, signal) => {
                if (code === null && signal === "SIGTERM") reject(new InternalServerErrorException({msg: "ChildProcess closed by Timeout!", code, signal}))
                stack.push(...stack.pop().toString().split(/\n/g));
                stack.pop();
                resolve(JSON.parse(stack.pop().toString()));
            });
        }
    );


    /**
     * ### 파이썬 라이브러리 버젼 최신인지 확인
     * - yfinance
     * - exchange_calendars
     */
    private isPyLibUptodate = () => new Promise<void>((resolve, reject) => {
        const result = {yfinance: "OutDated!!!", exchange_calendars: "OutDated!!!"};
        const cp = spawn(`${this.PIP_COMMAND}`, ['list', '--uptodate'], {timeout: 60000});
        cp.stdout.on('data', data => {
            const str = data.toString();
            if (/yfinance/.test(str)) {
                result.yfinance = "UpToDate";
            };
            if (/exchange-calendars/.test(str)) {
                result.exchange_calendars = "UpToDate";
            };
        });
        cp.on('error', err => this.logger.error(err));
        cp.stderr.on('data', data => this.logger.error(data.toString()));
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

    /**
     * ### PyLibChecker
     * 최신 버전인지 확인로그 띄우는 크론잡
     */
    private async pyLibChecker() {
        await this.isPyLibUptodate();
        try {
            this.logger.log(`PyLibChecker : ${(new Date(this.schedulerRegistry.getCronJob("pyLibChecker").nextDate().toString())).toLocaleString()}`);
        } catch (error) {
            if (error.message.slice(0, 56) === `No Cron Job was found with the given name (pyLibChecker)`) {
                const job = new CronJob("0 0 6 * * *", this.pyLibChecker.bind(this));
                this.schedulerRegistry.addCronJob("pyLibChecker", job);
                job.start();
                this.logger.log(`PyLibChecker : [New] ${(new Date(job.nextDate().toString())).toLocaleString()}`);
            } else {
                this.logger.error(error)
            };
        };
    }

}
