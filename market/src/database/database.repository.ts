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
        launcher: string
    ): Promise<StandardUpdatePriceResult> => {
        const session = await mongoose.connections[1].startSession(); // 1번째 커넥션을 쓴다는 표현이 별로인데?
        try {
            session.startTransaction();
            const updatePriceResult: UpdatePriceResult = {success: [], failure: []};
            await pipe(
                arr, toAsync,
                map(ele => ele.flatMapPromise(this.updatePrice(session))),
                each(ele => ele.isRight ? // *
                    updatePriceResult.success.push(ele.getRight) : updatePriceResult.failure.push(ele.getLeft)
                )
            );
            const updateResult = {
                updatePriceResult,
                updateSatusPriceResult: await this.updateStatusPriceByRegularUpdater(ISO_Code, previous_close, session),
                startTime,
                endTime: new Date().toISOString()
            };
            await this.createLogPriceUpdate(launcher, true, ISO_Code, updateResult);
            await session.commitTransaction();
            return updateResult;
        } catch (error) {
            this.logger.error(error);
            await session.abortTransaction();
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
    updateStatusPriceByRegularUpdater = (ISO_Code: string, previous_close: string, session: ClientSession) => this.status_priceRepo.updateByRegularUpdater(ISO_Code, previous_close, session);

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
    testPickLastUpdateLog = (ISO_Code: string) => this.log_priceUpdateRepo.testPickLastOne(ISO_Code);

    /**
     * ### log_priceUpdate Doc 생성 By launcher, updateResult, key
     */
    private createLogPriceUpdate = (
        launcher: string,
        isStandard: boolean,
        key: string | Array<string | Object>,
        updateResult: StandardUpdatePriceResult
    ) => this.log_priceUpdateRepo.create(launcher, isStandard, key, updateResult).then(_ => {
        if (launcher === "scheduler" || launcher === "initiator") {
            this.logger.verbose(`${key} : Log_priceUpdate Doc Created`)
        } else {
            this.logger.verbose(`${launcher} : Log_priceUpdate Doc Created`)
        }
    }).catch((error) => {
        this.logger.error(`${launcher} : Failed to Create Log_priceUpdate Doc!!!`);
        throw error;
    });

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

}