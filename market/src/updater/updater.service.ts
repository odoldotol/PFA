import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MarketService } from '../market/market.service';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob, CronTime } from 'cron';
import { catchError, firstValueFrom } from 'rxjs';
import { DBRepository } from '../database/database.repository';
import { OkEcSession } from '../interfaces/ecSession.interface';
import { YfInfo } from '../interfaces/yfInfo.interface';
import { YfPrice } from '../interfaces/yfPrice.interface';

@Injectable()
export class UpdaterService {

    private readonly logger = new Logger(UpdaterService.name);
    private readonly PRODUCT_URL = this.configService.get('PRODUCT_URL');
    private readonly TEMP_KEY = this.configService.get('TEMP_KEY');
    private readonly DE_UP_MARGIN: number = this.configService.get('DefaultUpdateMarginMilliseconds');

    constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
        private readonly marketService: MarketService,
        private readonly schedulerRegistry: SchedulerRegistry,
        private readonly dbRepo: DBRepository
    ) {
        this.initiator();
    }

    /**
     * ### 업데이터 초기실행
     * Status_price 에서 모든 Doc 들을 가져와서 각각의 Doc 을 병열처리
     * - Initiator 시작 종료 logger
     */
    async initiator() {
        try {
            /* logger */this.logger.warn("Initiator Run!!!");
            await this.dbRepo.setIsoCodeToTimezone();
            const spObjArr = await this.dbRepo.getAllStatusPrice();
            await Promise.all(spObjArr.map(async ({ISO_Code, lastMarketDate, yf_exchangeTimezoneName}) => {
                await this.generalInitiate(ISO_Code, lastMarketDate, yf_exchangeTimezoneName)
            }))
            .then(() => {
                /* logger */this.logger.warn("Initiator End!!!");
                if (process.send !== undefined) {
                    process.send('ready');
                    /* logger */this.logger.log("Send Ready to Parent Process");
                };
            })
            .catch((error) => {
                /* logger */this.logger.error(error)
            })
        } catch (error) {
            throw error
        };
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
    private async generalInitiate(ISO_Code: string, lastMarketDate: string, yf_exchangeTimezoneName: string) {
        try {
            const marketSession = await this.marketService.getMarketSessionByISOcode(ISO_Code);
            const previous_close = marketSession.previous_close;
            // price status 가 최신인지 알아내기
            if (this.isPriceStatusUpToDate(lastMarketDate, previous_close)) { // 최신이면
                /* logger */this.logger.verbose(`${ISO_Code} : UpToDate`)
            } else { // 최신 아니면 // Yf_CCC 는 항상 현재가로 초기화 되는점 알기 (isNotMarketOpen)
                const isNotMarketOpen = this.marketService.isNotMarketOpen(marketSession, ISO_Code)
                isNotMarketOpen ?
                /* logger */this.logger.verbose(`${ISO_Code} : Not UpToDate`) :
                /* logger */this.logger.verbose(`${ISO_Code} : Not UpToDate & Market Is Open`)
                // 가격 업데이트하기
                const updateResult = await this.updaterForPrice(ISO_Code, yf_exchangeTimezoneName, previous_close, isNotMarketOpen)
                // log_priceUpdate Doc 생성
                this.dbRepo.createLogPriceUpdate("initiator", updateResult, ISO_Code)
                // Product 애 regularUpdater 요청하기
                this.requestRegularUpdaterToProduct(ISO_Code, previous_close, updateResult)
            };
            // 다음마감시간에 업데이트스케줄 생성하기
            await this.schedulerForPrice(ISO_Code, yf_exchangeTimezoneName, marketSession)
        } catch (error) {
            throw error
        };
    }

    async testGeneralInitiate(ISO_Code: string) {
        try {
            const spObj = await this.dbRepo.getStatusPrice(ISO_Code)
            const yf_exchangeTimezoneName = spObj.yf_exchangeTimezoneName;
            const marketSession = await this.marketService.getMarketSessionByISOcode(ISO_Code)
            const previous_close = marketSession.previous_close;
            const isNotMarketOpen = this.marketService.isNotMarketOpen(marketSession, ISO_Code)
            const updateResult = await this.updaterForPrice(ISO_Code, yf_exchangeTimezoneName, previous_close, isNotMarketOpen)
            const updateLog = await this.dbRepo.createLogPriceUpdate("test", updateResult, ISO_Code)
            this.requestRegularUpdaterToProduct(ISO_Code, previous_close, updateResult)
            await this.schedulerForPrice(ISO_Code, yf_exchangeTimezoneName, marketSession)

            // const info = await this.dbRepo.testPickAsset(yf_exchangeTimezoneName);
            // const tickerArr = [info.symbol]
            return {
                spObj,
                marketSession,
                isUpToDate: this.isPriceStatusUpToDate(spObj.lastMarketDate, previous_close),
                isNotMarketOpen,
                updateResult,
                updateLog: updateLog ? updateLog : await this.dbRepo.testPickLastUpdateLog(ISO_Code),
                // info,
                // [tickerArr[0]]: (await this.marketService.getPriceByTickerArr(tickerArr))[0]
            }
            // if (isUpToDate) { // 최신이면
                // 다음마감시간에 업데이트스케줄 생성하기
                // /* logger */this.logger.verbose(`${ISO_Code} : UpToDate`)
                // await this.schedulerForPrice(ISO_Code, marketSession)
            // } else { // 최신 아니면 // Yf_CCC 는 항상 현재가로 초기화 되는점 알기 (isNotMarketOpen)
                // const isNotMarketOpen = this.isNotMarketOpen(marketSession, ISO_Code)
                // isNotMarketOpen ?
                // /* logger */this.logger.verbose(`${ISO_Code} : Not UpToDate`) :
                // /* logger */this.logger.verbose(`${ISO_Code} : Not UpToDate & Market Is Open`)
                // 가격 업데이트하기
                // const updateResult = await this.updatePriceByStatusPriceDocAndPreviousclose(spDoc, marketSession["previous_close"], isNotMarketOpen)
                // log_priceUpdate Doc 생성
                // this.createLogPriceUpdateDoc("initiator", updateResult, ISO_Code)
                // Product 애 regularUpdater 요청하기
                // this.requestRegularUpdaterToProduct(ISO_Code, marketSession["previous_close"], updateResult)
                // 다음마감시간에 업데이트스케줄 생성하기
                // await this.schedulerForPrice(ISO_Code, marketSession)
            // };
        } catch (error) {
            throw error
        };
    }

    /**
     * ### ISO code 와 marketSession 로 다음마감시간에 업데이트스케줄 생성|시간수정 하기
     */
    private async schedulerForPrice(ISO_Code: string, yf_exchangeTimezoneName: string, marketSession: OkEcSession) {
        try {
            // 마진 적용
            const {previousCloseDate, nextCloseDate} = await this.getMarginClose(ISO_Code, marketSession);
            // 마진적용한 직전 마감이 현재 시간보다 늦으면 직전마감이 다음 스케쥴시간이어야 한다
            // 이 경우 업데이트도 하지 않는게 옳지만, 이렇게 마진구간에서 이 함수가 실행되는 경우는 이니시에어터가 동작하는 등의 특별한 상황일것이므로 무시한다.
            const scheduleDate = previousCloseDate > new Date() ? previousCloseDate : nextCloseDate

            try {
                const schedule = this.schedulerRegistry.getCronJob(ISO_Code)
                const scheduleCronTime = new CronTime(scheduleDate)
                schedule.setTime(scheduleCronTime)
                /* logger */this.logger.log(`${ISO_Code} : scheduled ${scheduleDate.toLocaleString()}`);
            } catch (error) {
                if (error.message.slice(0, 48) === `No Cron Job was found with the given name (${ISO_Code})`) {
                    const newUpdateSchedule = new CronJob(scheduleDate, this.recusiveUpdaterForPrice.bind(this, ISO_Code, yf_exchangeTimezoneName));
                    this.schedulerRegistry.addCronJob(ISO_Code, newUpdateSchedule);
                    newUpdateSchedule.start();
                    /* logger */this.logger.log(`${ISO_Code} : [New]scheduled ${scheduleDate.toLocaleString()}`);
                } else {
                    /* logger */this.logger.error(error)
                }
            }
        } catch (error) {
            throw error
        };
    }

    /**
     * ### ISO_Code 와 marketSession 으로 직전 장 종료, 다음 장 종료에 yf 에서의 가격 딜레이 고려한 시간마진을 적용하여 반환
     */
    private async getMarginClose(ISO_Code: string, marketSession: OkEcSession) {
        try {
            const previousCloseDate = new Date(marketSession.previous_close)
            const nextCloseDate = new Date(marketSession.next_close)
            let marginMilliseconds: number = await this.dbRepo.getMarginMilliseconds(ISO_Code);
            if (marginMilliseconds === undefined) {
                marginMilliseconds = this.DE_UP_MARGIN
            };

            previousCloseDate.setMilliseconds(previousCloseDate.getMilliseconds() + marginMilliseconds);
            nextCloseDate.setMilliseconds(nextCloseDate.getMilliseconds() + marginMilliseconds);

            return {previousCloseDate, nextCloseDate};
        } catch (error) {
            throw error;
        };
    }

    /**
     * ### 가격 업데이터
     * 업뎃하고 다음 스케줄을 생성하는것 까지
     * - ISO_Code 로 가격 업데이트
     * - 다음마감시간에 업데이트스케줄 생성
     */
    private async recusiveUpdaterForPrice(ISO_Code: string, yf_exchangeTimezoneName: string) {
        try {
            const marketSession = await this.marketService.getMarketSessionByISOcode(ISO_Code);
            const previous_close = marketSession.previous_close;
            const updateResult = await this.updaterForPrice(ISO_Code, yf_exchangeTimezoneName, previous_close, true)
            this.dbRepo.createLogPriceUpdate("scheduler", updateResult, ISO_Code)
            this.requestRegularUpdaterToProduct(ISO_Code, previous_close, updateResult)
            await this.schedulerForPrice(ISO_Code, yf_exchangeTimezoneName, marketSession)
        } catch (error) {
            throw error
        };
    }

    /**
     * ### 가격 업데이트하기
     * - 업데이트 시작 종료 logger
     * - 가격 업데이트
     * - status 업뎃
     */
    private async updaterForPrice(ISO_Code: string, yf_exchangeTimezoneName: string, previous_close: string, isNotMarketOpen: boolean) {
        try {
            /* logger */this.logger.warn(`${ISO_Code} : Updater Run!!!`);
            const startTime = new Date().toISOString();

            const result = await Promise.all([
                // 가격 업데이트
                this.updatePriceByFilters([{exchangeTimezoneName: yf_exchangeTimezoneName}], true, isNotMarketOpen),
                // status 업뎃
                this.dbRepo.updateStatusPriceByRegularUpdater(ISO_Code, previous_close)
            ])
            .then(([updatePriceResult, updateSatusPriceResult]) => {
                /* logger */this.logger.warn(`${ISO_Code} : Updater End!!!`);
                return {
                    updatePriceResult: updatePriceResult[0],
                    updateSatusPriceResult,
                    startTime,
                    endTime: new Date().toISOString()
                };
            });

            return result;

        } catch (error) {
            throw error
        };
    }

    /**
     * ### Product 애 regularUpdater 요청하기
     */
    private async requestRegularUpdaterToProduct(ISO_Code: string, previous_close: string, updateResult) {
        try {
            const marketDate = previous_close.slice(0, 10);
            let priceArrs = updateResult.updatePriceResult["success"];
            priceArrs = priceArrs.map((priceArr) => {
                const regularMarketLastClose = priceArr[1].regularMarketLastClose;
                return [priceArr[0], regularMarketLastClose]
            })
            const result = (await firstValueFrom(
                this.httpService.post(`${this.PRODUCT_URL}market/updater/${ISO_Code}`, {marketDate, priceArrs, key: this.TEMP_KEY})
                .pipe(catchError(error => {
                    throw error;
                }))
            )).status;
            /* logger */this.logger.verbose(`${ISO_Code} : Product RegularUpdater Response status ${result}`,);
        } catch (error) {
            if (error.response) {
                /* logger */this.logger.error(error.response.data);
            };
            /* logger */this.logger.verbose(`${ISO_Code} : Product RegularUpdater Request Failed!`,);
        }
    }

    /**
     * ### 세션 정보 로 price status 가 최신인지 알아내기
     */
    private isPriceStatusUpToDate(lastMarketDate: string, previous_close: OkEcSession["previous_close"]) {
        try {
            const previousClose = new Date(previous_close).toISOString()
            return lastMarketDate === previousClose ? true : false
        } catch (error) {
            throw error
        };
    }

    /**
     * 티커배열로 가격 업데이트하기
     * - 가격 업뎃 구조 리팩터 필요
     */
    private async updatePriceByTickerArr(tickerArr: string[], lastClose: "regularMarketPreviousClose" | "regularMarketPrice") {
        try {
            // 가격 배열 가져오기
            const priceArr = await this.marketService.getPriceByTickerArr(tickerArr);

            return this.dbRepo.updatePriceByArr(tickerArr, priceArr, lastClose);
        } catch (error) {
            throw error;
        };
    }

    /**
     * ### 필터배열로 ticker 배열들 뽑아서 각각 updatePriceByTickerArr 실행
     * - 가격 업뎃 구조 리팩터 필요
     * - 추후에 단일 필터 솔루션을 따로 빼야함
     */
    private updatePriceByFilters(filterArr: object[], isStandard: boolean, isNotMarketOpen: boolean) {
        try {
            // db 에서 각 filter 들로 find 한 documents 들의 symbol 배열들을 만들어서 각각 updatePriceByTickerArr(symbol배열) 을 실행시켜!
            return Promise.all(filterArr.map(filter => {
                return this.dbRepo.getSymbolArr(filter)
                .then(symbolArr => {
                    if (isStandard && !isNotMarketOpen) {
                        return this.updatePriceByTickerArr(symbolArr, "regularMarketPreviousClose");
                    } else {
                        return this.updatePriceByTickerArr(symbolArr, "regularMarketPrice");
                    }
                })
                .catch((error) => {
                    return {error, filter};
                });
            }));
        } catch (error) {
            throw error;
        };
    }

    /**
     * ### mongoDB 에 신규 자산 생성해보고 그 작업의 결과를 반환
     * - tickerArr
     * - Yf_info 생성
     * - 필요시 Status_price 도 생성
     * - 리팩토링 필요, 단일 티커 처리 솔루션 따로 빼야함
     */
    async createAssets(tickerArr: string[]) {
        try {
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

            // 이미 존재하는거 걸러내기 // 서비스할때는 불필요한 작업. 초기에 대량으로 asset 추가할때 성능올리려고 추가 ------------------------
            // find 에 $in vs exists 둘중 어느것이 효과적일까?
            // 추후에 단일 티커 솔루션을 따로 빼야한다.
            const confirmedTickerArr = [];
            await Promise.all(tickerArr.map(async (ticker) => {
                if (await this.dbRepo.existsAssetByTicker(ticker) === null) {
                    confirmedTickerArr.push(ticker);
                } else {
                    result.failure.info.push({
                        msg: "Already exists",
                        ticker
                    })
                };
            }));

            if (confirmedTickerArr.length === 0) {
                return result;
            };
            // ---------------------------------------------------------------------------------------------------------

            // info 가져오기
            const infoArr = await this.marketService.getInfoByTickerArr(confirmedTickerArr/*tickerArr*/);
            // info 분류 (가져오기 성공,실패) + regularMarketLastClose
            const insertArr: YfInfo[] = [];
            await Promise.all(infoArr.map(async (info) => {
                if (info.error) {result.failure.info.push(info);}
                else {
                    const ISO_Code = await this.dbRepo.isoCodeToTimezone(info.exchangeTimezoneName);
                    if (ISO_Code === undefined) { // ISO_Code 를 못찾은 경우 실패처리
                        result.failure.info.push({
                            msg: "Could not find ISO_Code",
                            yf_exchangeTimezoneName: info.exchangeTimezoneName,
                            yfSymbol: info.symbol
                        })
                    } else {
                        // regularMarketLastClose
                        const marketSession = await this.marketService.getMarketSessionByISOcode(ISO_Code);
                        this.marketService.isNotMarketOpen(marketSession, ISO_Code)
                        ? info["regularMarketLastClose"] = info.regularMarketPrice
                        : info["regularMarketLastClose"] = info.regularMarketPreviousClose;
                        insertArr.push(info);
                    };
                };
            }));
            // info 를 mongoDB 에 저장
            await this.dbRepo.insertAssets(insertArr)
            .then((res)=>{
                result.success.info = res;
            })
            .catch((err)=>{
                result.failure.info = result.failure.info.concat(err.writeErrors);
                result.success.info = result.success.info.concat(err.insertedDocs);
            })

            // 신규 exchangeTimezoneName 발견시 추가하기
            await Promise.all(result.success.info.map(async info => {
                const yf_exchangeTimezoneName = info.exchangeTimezoneName;
                if (await this.dbRepo.existsStatusPrice({ yf_exchangeTimezoneName }) === null) { // 신규 exchangeTimezoneName!
                    const ISO_Code = await this.dbRepo.isoCodeToTimezone(yf_exchangeTimezoneName) // 불필요?
                    if (ISO_Code === undefined) { // ISO_Code 를 못찾은 경우 실패처리
                        result.failure.status_price.push({
                            msg: "Could not find ISO_Code",
                            yf_exchangeTimezoneName,
                            yfSymbol: info.symbol
                        })
                        /* logger */this.logger.warn(`${info.symbol} : Could not find ISO_Code for ${yf_exchangeTimezoneName}`);
                        return;
                    };

                    const marketSession = await this.marketService.getMarketSessionByISOcode(ISO_Code);
                    await this.dbRepo.createStatusPrice(ISO_Code, marketSession.previous_close, yf_exchangeTimezoneName)
                    .then(async (res)=>{
                        /* logger */this.logger.verbose(`${ISO_Code} : Created new status_price`);
                        result.success.status_price.push(res);
                        // 다음마감 업데이트스케줄 생성해주기
                        this.schedulerForPrice(ISO_Code, yf_exchangeTimezoneName, marketSession)
                    })
                    .catch((error)=>{
                        result.failure.status_price.push({
                            error,
                            yf_exchangeTimezoneName,
                            yfSymbol: info.symbol
                        });
                        /* logger */this.logger.warn(`${info.symbol} : Could not find ISO_Code for ${yf_exchangeTimezoneName}`);
                    });
                };
            }));

            return result;
        } catch (error) {
            throw error;
        }
    }

}
