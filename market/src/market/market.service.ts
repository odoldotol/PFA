import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom, map } from 'rxjs';
import * as F from "@fxts/core";
import { Either } from "@common/class/either.class";

@Injectable()
export class MarketService {

    private readonly logger = new Logger(MarketService.name);
    private readonly GETMARKET_URL = this.configService.get<string>('GETMARKET_URL');
    private readonly YFCCC_ISO_Code = this.configService.get<string>('YahooFinance_CCC_ISO_Code');

    constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
    ) {}

    // TODO: Refac - ChildApi Module 로 기능 분히하기

    fetchInfo = (ticker: string) => this.fetchSomething("Info", ticker)
        .then((res: Either<YfInfoError, GetMarketInfo>) => res.map(v => Object.assign(v.info, v.fastinfo, v.metadata, v.price) as YfInfo));

    fetchPrice = (ticker: string) => this.fetchSomething("Price", ticker)
        .then((res: Either<YfPriceError, Price>) => res.map(v => (v['symbol'] = ticker, v) as YfPrice));

    private fetchSomething = F.curry(async (something: string, ticker: string) => {
        const res = await this.fetching(
            `${this.GETMARKET_URL}yf/${something.toLowerCase()}/`, {ticker});
        if (res.error) return Either.left(res.error);
        else return Either.right(res);});

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
        } else {
            const res = await this.fetching(`${this.GETMARKET_URL}ec/session/`, { ISO_Code });
            if (res.error) return Either.left(res.error);
            return Either.right(res);};};

    private fetching = (url: string, data: object) => firstValueFrom(
        this.httpService
        .post(url, data)
        .pipe(
            catchError(error => {
                this.logger.error(error);
                throw error;}),
            map(res => res.data)))

}
