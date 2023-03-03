import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MarketService } from '../market/market.service';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob, CronTime } from 'cron';
import { catchError, firstValueFrom } from 'rxjs';
import { DBRepository } from '../database/database.repository';
import { pipe, map, toArray, toAsync, tap, each, filter, concurrent, peek, curry } from "@fxts/core";
import { Either } from "../monad/either";

@Injectable()
export class UpdaterService {

    private readonly logger = new Logger(UpdaterService.name);
    private readonly PRODUCT_URL = this.configService.get('PRODUCT_URL');
    private readonly TEMP_KEY: string = this.configService.get('TEMP_KEY');
    private readonly DE_UP_MARGIN: number = this.configService.get('DefaultUpdateMarginMilliseconds');
    private readonly GETMARKET_CONCURRENCY: number = this.configService.get('GETMARKET_CONCURRENCY');

    constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
        private readonly marketService: MarketService,
        private readonly schedulerRegistry: SchedulerRegistry,
        private readonly dbRepo: DBRepository
    ) {
        // 부모 프로세스 있으면 ready 메시지 보내기
        this.initiator()
        .then(() => process.send ? process.send('ready') && this.logger.log("Send Ready to Parent Process") : this.logger.log("Ready"))
        .catch(error => this.logger.error(error));
    }

    /**
     * ### 업데이터 초기실행
     * Status_price 에서 모든 Doc 들을 가져와서 각각의 Doc 으로 initiate
     * - 목적상 병열 처리 하지 않는게 좋아보인다.
     * - Initiator 시작 종료 logger
     */
    async initiator() {
        this.logger.warn("Initiator Run!!!");
        await this.dbRepo.setIsoCodeToTimezone();
        await pipe(
            await this.dbRepo.getAllStatusPrice(), toAsync,
            peek(this.generalInitiate.bind(this)),
            toArray,
            tap(() => this.logger.warn("Initiator End!!!")),
        );
    }

    /**
     * ### 표준 초기실행
     * - price status 가 최신인지 알아내기
     *      - 최신이면 "다음마감시간에 업데이트스케줄 생성하기"
     *      - 아니면 "장중인지 알아내기"
     * - 장중인지 알아내기
     *      - 장중이아니면 "가격 업데이트하기", "다음마감시간에 업데이트스케줄 생성하기"
     *      - 장중이면 "다음마감시간에 업데이트스케줄 생성하기"
     */
    private async generalInitiate({ISO_Code, lastMarketDate, yf_exchangeTimezoneName}: StatusPrice) {
        const exchangeSession = (await this.marketService.getExchangeSessionByISOcode(ISO_Code))
            .getRight2(InternalServerErrorException);
        if (this.isPriceStatusUpToDate(lastMarketDate, exchangeSession)) { // status 최신이면
            this.logger.verbose(`${ISO_Code} : UpToDate`);
        } else { // 최신 아니면 // Yf_CCC 는 항상 현재가로 초기화 되는점 알기 (isNotMarketOpen)
            const isNotMarketOpen = await this.isNotMarketOpen(exchangeSession);
            isNotMarketOpen ? this.logger.verbose(`${ISO_Code} : Not UpToDate`)
            : this.logger.verbose(`${ISO_Code} : Not UpToDate & Market Is Open`);
            await this.updaterForPrice(ISO_Code, yf_exchangeTimezoneName, exchangeSession, isNotMarketOpen, "initiator");
        };
        // 업데이트스케줄 생성
        await this.schedulerForPrice(ISO_Code, yf_exchangeTimezoneName, exchangeSession);
    }

    /**
     * ### tester
     */
    async testGeneralInitiate(ISO_Code: string) {
        const spObj = await this.dbRepo.getStatusPrice(ISO_Code);
        if (!spObj) throw new BadRequestException("ISO_Code is not valid");
        const yf_exchangeTimezoneName = spObj.yf_exchangeTimezoneName;
        const exchangeSession = (await this.marketService.getExchangeSessionByISOcode(ISO_Code))
            .getRight2(InternalServerErrorException);
        const isNotMarketOpen = await this.isNotMarketOpen(exchangeSession);
        await this.updaterForPrice(ISO_Code, yf_exchangeTimezoneName, exchangeSession, isNotMarketOpen, "test");
        await this.schedulerForPrice(ISO_Code, yf_exchangeTimezoneName, exchangeSession);
        // const info = await this.dbRepo.testPickAsset(yf_exchangeTimezoneName);
        // const tickerArr = [info.symbol]
        return {
            spObj: await this.dbRepo.getStatusPrice(ISO_Code),
            exchangeSession,
            isUpToDate: this.isPriceStatusUpToDate(spObj.lastMarketDate, exchangeSession),
            isNotMarketOpen,
            updateLog: await this.dbRepo.testPickLastUpdateLog(),
            // info,
            // [tickerArr[0]]: (await this.marketService.getPriceByTickerArr(tickerArr))[0]
        };
    }

    /**
     * ### ISO code 와 exchangeSession 로 다음마감시간에 업데이트스케줄 생성|시간수정 하기
     */
    private async schedulerForPrice(ISO_Code: string, yf_exchangeTimezoneName: string, exchangeSession: ExchangeSession) {
        // 마진 적용
        const {previousCloseDate, nextCloseDate} = await this.getMarginClose(ISO_Code, exchangeSession);
        // 마진적용한 직전 마감이 현재 시간보다 늦으면 직전마감이 다음 스케쥴시간이어야 한다
        // 이 경우 업데이트도 하지 않는게 옳지만, 이렇게 마진구간에서 이 함수가 실행되는 경우는 이니시에어터가 동작하는 등의 특별한 상황일것이므로 무시한다.
        const scheduleDate = previousCloseDate > new Date() ? previousCloseDate : nextCloseDate;
        try {
            const schedule = this.schedulerRegistry.getCronJob(ISO_Code);
            schedule.setTime(new CronTime(scheduleDate));
            this.logger.log(`${ISO_Code} : scheduled ${scheduleDate.toLocaleString()}`);
        } catch (error) {
            if (error.message.slice(0, 48) === `No Cron Job was found with the given name (${ISO_Code})`) {
                const newUpdateSchedule = new CronJob(scheduleDate, this.recusiveUpdaterForPrice.bind(this, ISO_Code, yf_exchangeTimezoneName));
                this.schedulerRegistry.addCronJob(ISO_Code, newUpdateSchedule);
                newUpdateSchedule.start();
                this.logger.log(`${ISO_Code} : [New]scheduled ${scheduleDate.toLocaleString()}`);
            } else {
                this.logger.error(error)
            };
        };
    }

    /**
     * ### ISO_Code 와 exchangeSession 으로 직전 장 종료, 다음 장 종료에 yf 에서의 가격 딜레이 고려한 시간마진을 적용하여 반환
     */
    private async getMarginClose(ISO_Code: string, exchangeSession: ExchangeSession) {
        const previousCloseDate = new Date(exchangeSession.previous_close);
        const nextCloseDate = new Date(exchangeSession.next_close);
        let marginMilliseconds: number = await this.dbRepo.getMarginMilliseconds(ISO_Code);
        if (marginMilliseconds === undefined) marginMilliseconds = this.DE_UP_MARGIN;
        previousCloseDate.setMilliseconds(previousCloseDate.getMilliseconds() + marginMilliseconds);
        nextCloseDate.setMilliseconds(nextCloseDate.getMilliseconds() + marginMilliseconds);
        return {previousCloseDate, nextCloseDate};
    }

    /**
     * ### 가격 업데이터
     * 업뎃하고 다음 스케줄을 생성하는것 까지
     * - ISO_Code 로 가격 업데이트
     * - 다음마감시간에 업데이트스케줄 생성
     */
    private async recusiveUpdaterForPrice(ISO_Code: string, yf_exchangeTimezoneName: string) {
        const exchangeSession = (await this.marketService.getExchangeSessionByISOcode(ISO_Code))
            .getRight2(InternalServerErrorException);
        await this.updaterForPrice(ISO_Code, yf_exchangeTimezoneName, exchangeSession, true, "scheduler");
        await this.schedulerForPrice(ISO_Code, yf_exchangeTimezoneName, exchangeSession);
    }

    /**
     * ### 가격 업데이트하기 <Standard>
     */
    private async updaterForPrice(
        ISO_Code: string,
        yf_exchangeTimezoneName: string,
        {previous_close}: ExchangeSession,
        isNotMarketOpen: boolean,
        launcher: LogPriceUpdate["launcher"]
    ) {
        this.logger.warn(`${ISO_Code} : Updater Run!!!`);
        const startTime = new Date().toISOString();
        await this.dbRepo.updatePriceStandard(
            await pipe(
                await this.dbRepo.getSymbolArr({exchangeTimezoneName: yf_exchangeTimezoneName}), toAsync,
                map(this.marketService.getPriceByTicker),
                map(ele => ele.map(this.fulfillUpdatePriceSet(isNotMarketOpen))),
                concurrent(this.GETMARKET_CONCURRENCY),
                toArray
            ),
            ISO_Code,
            previous_close,
            startTime,
            launcher
        ).then(updateResult => {
            this.logger.warn(`${ISO_Code} : Updater End!!!`);
            this.requestRegularUpdaterToProduct(ISO_Code, previous_close, updateResult.updatePriceResult);
        }).catch(_ => {
            this.logger.warn(`${ISO_Code} : Updater Failed!!!`);
        });
    }

    /**
     * ### fulfillUpdatePriceSet
     */
    private fulfillUpdatePriceSet = curry((
        isNotMarketOpen: boolean,
        {symbol, regularMarketPreviousClose, regularMarketPrice}: YfPrice
    ): UpdatePriceSet => [
        symbol,
        {
            regularMarketPreviousClose,
            regularMarketPrice,
            regularMarketLastClose: isNotMarketOpen ? regularMarketPrice : regularMarketPreviousClose
        }
    ]);

    /**
     * ### Product 애 regularUpdater 요청하기
     * - 실패하면 단 한번 5분뒤에 재시도
     */
    private requestRegularUpdaterToProduct(
        ISO_Code: string,
        previous_close: ExchangeSession["previous_close"],
        updatePriceResult: UpdatePriceResult
    ) {
        const marketDate = previous_close.slice(0, 10);
        let priceArrs = pipe(
            updatePriceResult,
            filter(ele => ele.isRight),
            map(ele => ele.getRight),
            map(ele => [ele[0], ele[1].regularMarketLastClose]),
            toArray
        );

        const rq = async (retry: boolean = false) => {
            try {
                this.logger.verbose(`${ISO_Code} : RegularUpdater Product Response status ${(await firstValueFrom(
                    this.httpService.post(`${this.PRODUCT_URL}market/updater/${ISO_Code}`, { marketDate, priceArrs, key: this.TEMP_KEY })
                    .pipe(catchError(error => {
                        throw error; // 
                    }))
                ).catch(error => {
                    if (error.response) this.logger.error(error.response.data);
                    throw error;
                })).status}`);
            } catch (error) {
                this.logger.error(error);
                if (retry) {
                    this.logger.warn(`${ISO_Code} : RequestRegularUpdater Failed`);
                } else {
                    const retryDate = new Date();
                    retryDate.setMinutes(retryDate.getMinutes() + 5);
                    const retry = new CronJob(retryDate, rq.bind(this, true));
                    this.schedulerRegistry.addCronJob(ISO_Code + "_requestRegularUpdater", retry);
                    retry.start();
                    this.logger.warn(`${ISO_Code} : Retry RequestRegularUpdater after 5 Min. ${retryDate.toLocaleString()}`);
                };
            };
        };

        rq();
    }

    /**
     * ### 세션 정보 로 price status 가 최신인지 알아내기
     */
    private isPriceStatusUpToDate = (lastMarketDate: string, {previous_close}: ExchangeSession) => 
        lastMarketDate === new Date(previous_close).toISOString() ? true : false;

    /**
     * ###
     */
    private updatePriceByFilterArr

    /**
     * ###
     */
    private updatePriceByFilter

    /**
     * ### 티커배열로 가격 업데이트하기
     */
    private updatePriceByTickerArr

    /**
     * ### mongoDB 에 신규 자산 생성해보고 그 작업의 결과를 반환
     * - tickerArr 로 Yf_info 생성
     * - 새로운 거래소의 자산 발견시 Status_price 생성하고 업데이트스케줄 등록
     */
    async createAssetByTickerArr(tickerArr: string[]) {
        const result = { // 응답
            success: {
                info: [],
                status_price: [],
            },
            failure: {
                info: [],
                status_price: [],
            }
        };
        const spMap: Map<string, string[]> = new Map();
        await pipe( // 중복제거와 exists필터 부분은 단일 티커처리시 필요없음. 이 부분 보완하기
            new Set(tickerArr).values(), toAsync,
            map(this.createAssetTickerFilter), // exists?
            map(ele => ele.flatMapPromise(this.marketService.getInfoByTicker)),
            map(ele => ele.flatMapPromise(this.fulfillYfInfo)),
            filter(ele => ele.isLeft ? // *
            (result.failure.info.push(ele.getLeft), false)
            : true),
            map(ele => ele.getRight),
            concurrent(this.GETMARKET_CONCURRENCY),
            toArray,
            tap(async arr => { // *
                await this.dbRepo.insertAssets(arr)
                .then(res => result.success.info = res)
                .catch(err =>
                    (result.failure.info = result.failure.info.concat(err.writeErrors),
                    result.success.info = result.success.info.concat(err.insertedDocs))
                )
            }),
            each(ele => spMap.has(ele.exchangeTimezoneName) ? // *
                spMap.get(ele.exchangeTimezoneName).push(ele.symbol)
                : spMap.set(ele.exchangeTimezoneName, [ele.symbol])
            )
        );
        await pipe(
            spMap, toAsync,
            filter(this.isNewExchange),
            map(this.applyNewExchange),
            each(ele => ele.isRight ? // *
                result.success.status_price.push(ele.getRight)
                : result.failure.status_price.push(ele.getLeft)
            )
        );
        return result;
    }

    /**
     * ### createAssetTickerFilter
     */
    private createAssetTickerFilter = async (ticker: string): Promise<Either<any, string>> =>
        (await this.dbRepo.existsAssetByTicker(ticker) === null) ? Either.right(ticker)
        : Either.left({ msg: "Already exists", ticker });

    /**
     * ### fulfillInfo
     */
    private fulfillYfInfo = async (info: YfInfo): Promise<Either<any, FulfilledYfInfo>> => {
        const ISO_Code = await this.dbRepo.isoCodeToTimezone(info.exchangeTimezoneName);
        return ISO_Code === undefined ? // ISO_Code 를 못찾은 경우 실패처리
        Either.left({
            msg: "Could not find ISO_Code",
            yf_exchangeTimezoneName: info.exchangeTimezoneName,
            yfSymbol: info.symbol
        })
        : Either.right({
            ...info,
            regularMarketLastClose: await this.isNotMarketOpen(ISO_Code) ? info.regularMarketPrice : info.regularMarketPreviousClose
        });
    }

    /**
     * ### 장중이 아니면 true, 장중이면 false 리턴
     * - ExchangeSession 또는 ISO_Code 를 인자로 받는다.
     * 
     * 짧은 시간 연속처리시 market모듈에 ExchangeSession 를 반복 요청하는 등의 isNotMarketOpen 반복 계산 않도록 함(시간 오차범위는 최대 1분으로 제한)
     * - ISO_Code 를 받으면 db모듈에 저장된 값을 조회하고, ExchangeSession을 받으면 연산해서 알려준다.
     * - db모듈에서 값을 읽지 못하면 market모듈에 ExchangeSession을 요청하고 연산해서 db모듈에 값을 저장하고 리턴한다.
     * - db모듈에서 데이터가 매 00초마다 폐기되므로 데이터의 오차범위는 최대 1분이 됨.
     */
    private isNotMarketOpen = async (prop: ExchangeSession|string) => {
        
        const f = (es: ExchangeSession) => {
            const {previous_open, previous_close, next_open, next_close} = es;
            return new Date(previous_open) > new Date(previous_close) && new Date(next_open) > new Date(next_close) ? false : true;
        };
        
        if (typeof prop === 'string') {
            const res = await this.dbRepo.getIsNotMarketOpen(prop);
            return res === undefined ? 
            this.dbRepo.setIsNotMarketOpen(prop, f((await this.marketService.getExchangeSessionByISOcode(prop)).getRight2(InternalServerErrorException)))
            : res;
        } else {
            return f(prop);
        };
    }

    /**
     * ###
     */
    private isNewExchange = async ([yf_exchangeTimezoneName, _]: [string, string[]]) =>
        await this.dbRepo.existsStatusPrice({ yf_exchangeTimezoneName }) === null;

    /**
     * ###
     */
    private applyNewExchange = async ([yf_exchangeTimezoneName, symbolArr]: [string, string[]]): Promise<Either<any, StatusPrice>> => {
        const ISO_Code = await this.dbRepo.isoCodeToTimezone(yf_exchangeTimezoneName);
        if (ISO_Code === undefined) {
            this.logger.error(`${symbolArr[0]} : Could not find ISO_Code for ${yf_exchangeTimezoneName}`);
            return Either.left({
                msg: "Could not find ISO_Code",
                yf_exchangeTimezoneName,
                symbol: symbolArr
            });
        } else {
            const exchangeSession = (await this.marketService.getExchangeSessionByISOcode(ISO_Code))
                .getRight2(InternalServerErrorException);
            return await this.dbRepo.createStatusPrice(ISO_Code, exchangeSession.previous_close, yf_exchangeTimezoneName)
            .then(async res => {
                this.logger.verbose(`${ISO_Code} : Created new status_price`);
                this.schedulerForPrice(ISO_Code, yf_exchangeTimezoneName, exchangeSession);
                return Either.right(res);
            }).catch(error => {
                this.logger.error(error);
                return Either.left({
                    error,
                    yf_exchangeTimezoneName,
                    symbol: symbolArr
                });
            });
        };
    }
}
