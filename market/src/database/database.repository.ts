import { CACHE_MANAGER, Inject, Injectable, Logger } from "@nestjs/common";
import { Yf_infoRepository } from "./mongodb/repository/yf-info.repository";
import { Status_priceRepository } from "./mongodb/repository/status_price.repository";
import { Config_exchangeRepository } from "./mongodb/repository/config_exchane.repository";
import { Log_priceUpdateRepository } from "./mongodb/repository/log_priceUpdate.repository";
import { ConfigExchangeDto } from "../dto/configExchange.dto";
import { Cache } from 'cache-manager';
import { curry } from "@fxts/core";
import { Either } from "../monad/either";

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
     * ### updatePrice
     */
    updatePrice = curry((isNotMarketOpen: boolean, price: YfPrice):
    Promise<Either<UpdatePriceError, UpdatePriceResult>> => {
        const {symbol, regularMarketPreviousClose, regularMarketPrice} = price;
        const fulfilledPrice: FulfilledYfPrice = {
            regularMarketPreviousClose,
            regularMarketPrice,
            regularMarketLastClose: isNotMarketOpen ? regularMarketPrice : regularMarketPreviousClose,
        };
        return this.yf_infoRepo.updatePrice(
            symbol,
            {
                regularMarketPreviousClose,
                regularMarketPrice,
                regularMarketLastClose: fulfilledPrice.regularMarketLastClose,
            }
        ).then(result => {
            // const successRes = {
            //     acknowledged: true,
            //     modifiedCount: 1,
            //     upsertedId: null,
            //     upsertedCount: 0,
            //     matchedCount: 1
            // }
            if (
                result.acknowledged &&
                result.modifiedCount === 1 &&
                result.upsertedId === null &&
                result.upsertedCount === 0 &&
                result.matchedCount === 1
            ) {
                const result: UpdatePriceResult = [symbol, fulfilledPrice]
                return Either.right(result);
            } else {
                return Either.left({error: "updateOne error", ticker: symbol, result});
            };
        }).catch(error => Either.left({error, ticker: symbol}));
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
    updateStatusPriceByRegularUpdater = (ISO_Code: string, previous_close: string) => this.status_priceRepo.updateByRegularUpdater(ISO_Code, previous_close);

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
    createLogPriceUpdate = (
        launcher: string,
        isStandard: boolean,
        key: string | Array<string | Object>,
        updateResult: FlattenStandardUpdatePriceResult
    ): Promise<Either<Error, LogPriceUpdate>> =>
    this.log_priceUpdateRepo.create(launcher, isStandard, key, updateResult)
    .then(doc => {
        if (launcher === "scheduler" || launcher === "initiator") {
            this.logger.verbose(`${key} : Log_priceUpdate Doc Created`)
        } else {
            this.logger.verbose(`Log_priceUpdate Doc Created : ${launcher}`)
        }
        return Either.right(doc);
    })
    .catch((error) => {
        this.logger.error(error)
        return Either.left(error);
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