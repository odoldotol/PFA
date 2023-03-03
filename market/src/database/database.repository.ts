import { CACHE_MANAGER, Inject, Injectable, Logger } from "@nestjs/common";
import { Yf_infoRepository } from "./mongodb/repository/yf-info.repository";
import { Status_priceRepository } from "./mongodb/repository/status_price.repository";
import { Config_exchangeRepository } from "./mongodb/repository/config_exchane.repository";
import { Log_priceUpdateRepository } from "./mongodb/repository/log_priceUpdate.repository";
import { ConfigExchangeDto } from "../dto/configExchange.dto";
import { Cache } from 'cache-manager';
import { curry, each, map, pipe, toArray, toAsync } from "@fxts/core";
import { Either } from "../monad/either";
import mongoose, { ClientSession } from "mongoose";

@Injectable()
export class DBRepository {

    private readonly logger = new Logger(DBRepository.name);

    constructor(
        private readonly yf_infoRepo: Yf_infoRepository,
        private readonly status_priceRepo: Status_priceRepository,
        private readonly log_priceUpdateRepo: Log_priceUpdateRepository,
        private readonly config_exchangeRepo: Config_exchangeRepository,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) {}
    
    /**
     * ### getAllAssetsInfo
     */
    getAllAssetsInfo = () => this.yf_infoRepo.findAll();

    /**
     * ### ISO_Code 로 조회 => [ticker, price][]
     */
    getPriceByISOcode = async (ISO_Code: string) =>
    this.yf_infoRepo.findPricesByExchange(await this.isoCodeToTimezone(ISO_Code))
    .then(arr => arr.map(ele => [ele.symbol, ele.regularMarketLastClose]));

    /**
     * ### getPriceByTicker
     */
    getPriceByTicker = (ticker: string) => this.yf_infoRepo.findPriceBySymbol(ticker);

    /**
     * ### testPickAsset
     */
    testPickAsset = (exchangeTimezoneName: string) => this.yf_infoRepo.testPickOne(exchangeTimezoneName);

    /**
     * ### updatePriceTx
     * - 가격 업데이트
     * - StatusPrice 업데이트
     * - 업데이트 로그 생성
     */
    updatePriceStandard = async (
        arr: Either<YfPriceError, UpdatePriceSet>[],
        ISO_Code: string,
        previous_close: string,
        startTime: string,
        launcher: LogPriceUpdate["launcher"]
    ): Promise<StandardUpdatePriceResult> => {
        const session = await mongoose.connections[1].startSession(); // 1번째 커넥션을 쓴다는 표현이 별로인데?
        try {
            session.startTransaction();
            const updateResult = {
                updatePriceResult: await pipe(
                    arr, toAsync,
                    map(ele => ele.flatMapPromise(this.updatePrice(session))),
                    toArray
                ),
                updateSatusPriceResult: await this.updateStatusPriceByRegularUpdater(ISO_Code, previous_close, session),
                startTime,
                endTime: new Date().toISOString()
            };
            await this.createLogPriceUpdate(launcher, true, ISO_Code, updateResult, session);
            await session.commitTransaction();
            return updateResult;
        } catch (error) {
            this.logger.error(error);
            await session.abortTransaction(); // 에러가 있다면 commitTransaction 전에 에러이기때문에 지금 상태로는 없어도 아무이상없는것같음?
            throw error;
        } finally {
            session.endSession();
        }
    };

    /**
     * ### updatePrice
     */
    private updatePrice = curry((session: ClientSession, updatePriceSet: UpdatePriceSet):
    Promise<Either<UpdatePriceError, UpdatePriceSet>> => {
        return this.yf_infoRepo.updatePrice(...updatePriceSet, session)
        .then(res => {
            // const successRes = {
            //     acknowledged: true,
            //     modifiedCount: 1,
            //     upsertedId: null,
            //     upsertedCount: 0,
            //     matchedCount: 1
            // }
            if (
                res.acknowledged &&
                res.modifiedCount === 1 &&
                res.upsertedId === null &&
                res.upsertedCount === 0 &&
                res.matchedCount === 1
            ) {
                return Either.right(updatePriceSet);
            } else {
                return Either.left({error: "updateOne error", ticker: updatePriceSet[0], res});
            };
        });
    });

    /**
     * ### getSymbolArr
     */
    getSymbolArr = async (filter: object) =>
    (await this.yf_infoRepo.find(filter, '-_id symbol'))
    .map(doc => doc.symbol);

    /**
     * ### existsAssetByTicker
     */
    existsAssetByTicker = (ticker: string) => this.yf_infoRepo.exists(ticker);

    /**
     * ### insertAssets
     */
    insertAssets = (assetArr: FulfilledYfInfo[]) => this.yf_infoRepo.insertMany(assetArr);

    /**
     * ### getAllStatusPrice
     */
    getAllStatusPrice = () => this.status_priceRepo.findAll();

    /**
     * ### getStatusPrice
     */
    getStatusPrice = (ISO_Code: string) => this.status_priceRepo.findOneByISOcode(ISO_Code);

    /**
     * ### updateStatusPriceByRegularUpdater
     */
    private updateStatusPriceByRegularUpdater = (ISO_Code: string, previous_close: string, session: ClientSession) =>
    this.status_priceRepo.findOneAndUpdate(
        { ISO_Code },
        { lastMarketDate: new Date(previous_close).toISOString() },
        session
    );

    /**
     * ### existsStatusPrice
     */
    existsStatusPrice = (filter: object) => this.status_priceRepo.exists(filter);

    /**
     * ### createStatusPrice
     */
    createStatusPrice = (ISO_Code: string, previous_close: string, yf_exchangeTimezoneName: string) =>
    this.status_priceRepo.createOne(
        ISO_Code,
        new Date(previous_close).toISOString(),
        yf_exchangeTimezoneName
    );

    /**
     * ### createConfigExchange
     */
    createConfigExchange = (body: ConfigExchangeDto) => this.config_exchangeRepo.createOne(body);

    /**
     * ### getMarginMilliseconds
     */
    getMarginMilliseconds = (ISO_Code: string) => this.config_exchangeRepo.findMarginMilliseconds(ISO_Code);

    /**
     * ### testPickLastUpdateLog
     */
    testPickLastUpdateLog = () => this.log_priceUpdateRepo.find1();

    /**
     * ### log_priceUpdate Doc 생성 By launcher, updateResult, key
     */
    private createLogPriceUpdate = (
        launcher: LogPriceUpdate["launcher"],
        isStandard: boolean,
        key: string | Array<string | Object>,
        updateResult: StandardUpdatePriceResult,
        session: ClientSession
    ) => {
        const newLogDoc: LogPriceUpdate = {
            launcher,
            isStandard,
            key,
            success: [],
            failure: [],
            startTime: updateResult.startTime,
            endTime: updateResult.endTime,
            duration: new Date(updateResult.endTime).getTime() - new Date(updateResult.startTime).getTime()
        }
        pipe(
            updateResult.updatePriceResult,
            each(ele => ele.isRight ?
            newLogDoc.success.push(ele.getRight) : newLogDoc.failure.push(ele.getLeft)
            )
        );
        return this.log_priceUpdateRepo.create(newLogDoc, session).then(_ => {
            if (launcher === "scheduler" || launcher === "initiator") {
                this.logger.verbose(`${key} : Log_priceUpdate Doc Created`)
            } else {
                this.logger.verbose(`${launcher} : Log_priceUpdate Doc Created`)
            }
        }).catch((error) => {
            this.logger.error(`${launcher} : Failed to Create Log_priceUpdate Doc!!!`);
            throw error;
        });
    }

    /**
     * ### ISO code 를 yahoofinance exchangeTimezoneName 로 변환 혹은 그 반대를 수행
     * - 없으면 전체 갱신후 재시도
     */
    async isoCodeToTimezone(something: string): Promise<string> {
        const result: string = await this.cacheManager.get(something);
        if (!result) {
            await this.setIsoCodeToTimezone();
            return await this.cacheManager.get(something);
        };
        return result;
    }

    /**
     * isoCodeToTimezone 갱신
     */
    setIsoCodeToTimezone = async () => Promise.all(
        (await this.config_exchangeRepo.findAllIsoCodeAndTimezone())
        .map(async isoCodeAndTimezone => {
            await this.cacheManager.set(isoCodeAndTimezone.ISO_Code, isoCodeAndTimezone.ISO_TimezoneName);
            await this.cacheManager.set(isoCodeAndTimezone.ISO_TimezoneName, isoCodeAndTimezone.ISO_Code);
        })
    );

    /**
     * ### Get last 5 UpdateLog
     */
    getUpdateLog = (ISO_Code?: string, limit?: number) =>
    this.log_priceUpdateRepo.find1(
        ISO_Code ? { key: ISO_Code } : {},
        limit ? limit : 5
    );

    /**
     * ### setIsNotMarketOpen
     * - 1뷴에 한번만 갱신할 수 있도록 ttl 설정
     */
    setIsNotMarketOpen = (ISO_Code: string, isNotMarketOpen: boolean) => this.cacheManager.set(ISO_Code + "_isNotMarketOpen", isNotMarketOpen, { ttl: 60 - new Date().getSeconds() });

    /**
     * ### getIsNotMarketOpen
     */
    getIsNotMarketOpen = (ISO_Code: string): Promise<boolean> => this.cacheManager.get(ISO_Code + "_isNotMarketOpen");

}