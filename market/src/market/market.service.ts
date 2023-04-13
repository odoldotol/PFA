import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom } from 'rxjs';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { pipe, map, toArray, toAsync, curry, concurrent } from "@fxts/core";
import { Either } from "../class/either.class";

@Injectable()
export class MarketService implements OnApplicationBootstrap {

    private readonly logger = new Logger(MarketService.name);
    private readonly GETMARKET_URL = this.configService.get<string>('GETMARKET_URL');
    private readonly PIP_COMMAND = this.configService.get<string>('PIP_COMMAND');
    private readonly YFCCC_ISO_Code = this.configService.get<string>('YahooFinance_CCC_ISO_Code');

    constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
        private readonly schedulerRegistry: SchedulerRegistry,
    ) {}

    onApplicationBootstrap = () => {
        this.pyLibChecker()
    };

    fetchInfo = (ticker: string): Promise<Either<YfInfoError, YfInfo>> => this.fetchSomething("Info", ticker);
    fetchPrice = (ticker: string): Promise<Either<YfPriceError, YfPrice>> => this.fetchSomething("Price", ticker);

    private fetchSomething = curry(async (something: string, ticker: string) => {
        const res = await this.fetching(
            `${this.GETMARKET_URL}yf/${something.toLowerCase()}/`, {ticker},
            [`get${something}ByTicker.py`, ticker]
        );
        if (res.error) return Either.left(res.error);
        else return Either.right(Object.assign(res.info, res.fastinfo, res.metadata, res.price));});    

    // TODO - Refac
    fetchExchangeSession = async (ISO_Code: string): Promise<Either<ExchangeSessionError, ExchangeSession>> => {
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
        const res = await this.fetching(
            `${this.GETMARKET_URL}ec/session/`, { ISO_Code },
            ['getSessionByISOcode.py', ISO_Code]
        );
        if (res.error) return Either.left(res.error);
        return Either.right(res);};

    /**
     * #### TODO - Refac
     * - getMarket 서버를 이용할 수 없을 경우 자식 프로세스에서 시도한다.
     */
    private fetching = (url: string, data: object, pyCpArgs: string[]) => firstValueFrom(
        this.httpService.post(url, data)
        .pipe(catchError(error => {
            throw error; //[Todo] 에러 핸들링
        }))
    ).catch(error => { // 실패시 자식프로세스에서 시도
        this.logger.error(error);
        return this.runPyCp(pyCpArgs);
    }).then(res => res.data);

    private runPyCp = ([fileName, arg]: string[]) =>
        ({ data: this.getStdoutByChildProcess(this.getPyChildProcess([fileName, arg])) });

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
     * - TODO - Refac - outdated 일때는 버젼도 출력하도록 기능도 추가하기
     */
    private isPyLibUptodate = () => new Promise<void>((resolve, reject) => {
        const result = { yfinance: "OutDated!!!", exchange_calendars: "OutDated!!!" };
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
     * #### TODO - Refac
     * 최신 버전인지 확인로그 띄우는 크론잡
     */
    private async pyLibChecker() {
        await this.isPyLibUptodate();
        try {
            if (this.schedulerRegistry.doesExist("cron", "pyLibChecker")) {
                this.logger.log(`PyLibChecker : ${(new Date(this.schedulerRegistry.getCronJob("pyLibChecker").nextDate().toString())).toLocaleString()}`);
            } else {
                const job = new CronJob("0 0 6 * * *", this.pyLibChecker.bind(this));
                this.schedulerRegistry.addCronJob("pyLibChecker", job);
                job.start();
                this.logger.log(`PyLibChecker : [New] ${(new Date(job.nextDate().toString())).toLocaleString()}`);
            };
        } catch (error) {
            this.logger.error(error);
        };
    }

}
