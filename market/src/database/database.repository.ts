import { CACHE_MANAGER, Inject, Injectable, Logger } from "@nestjs/common";
import { Yf_infoRepository } from "./mongodb/repository/yf-info.repository";
import { Status_priceRepository } from "./mongodb/repository/status_price.repository";
import { Config_exchangeRepository } from "./mongodb/repository/config_exchane.repository";
import { Log_priceUpdateRepository } from "./mongodb/repository/log_priceUpdate.repository";
import { Cache } from 'cache-manager';
import { curry, each, map, pipe, toArray, toAsync } from "@fxts/core";
import { Either } from "src/common/class/either";
import mongoose, { ClientSession } from "mongoose";
import { StandardUpdatePriceResult } from "src/common/interface/updatePriceResult.interface";

@Injectable()
export class DBRepository {

    private readonly logger = new Logger(DBRepository.name);

    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private readonly config_exchangeRepo: Config_exchangeRepository,
        private readonly log_priceUpdateRepo: Log_priceUpdateRepository,
        private readonly status_priceRepo: Status_priceRepository,
        private readonly yf_infoRepo: Yf_infoRepository,
    ) {}
    
    createConfigExchange = this.config_exchangeRepo.createOne;
    
    createStatusPrice = (ISO_Code: string, previous_close: string, yf_exchangeTimezoneName: string) =>
        this.status_priceRepo.createOne(
            ISO_Code,
            new Date(previous_close).toISOString(),
            yf_exchangeTimezoneName);
    
    createAssets = this.yf_infoRepo.insertMany;

    readMarginMs = this.config_exchangeRepo.findMarginMilliseconds;
    testPickLastUpdateLog = this.log_priceUpdateRepo.find1;

    readUpdateLog = (ISO_Code?: string, limit?: number) => this.log_priceUpdateRepo.find1(
        ISO_Code ? { key: ISO_Code } : {},
        limit ? limit : 5);

    existsStatusPrice = this.status_priceRepo.exists;
    readAllStatusPrice = this.status_priceRepo.findAll;
    readStatusPrice = this.status_priceRepo.findOneByISOcode;
    existsAssetByTicker = this.yf_infoRepo.exists;
    testPickAsset = this.yf_infoRepo.testPickOne;
    readAllAssetsInfo = this.yf_infoRepo.findAll;
    readPriceByTicker = this.yf_infoRepo.findPriceBySymbol;

    readSymbolArr = async (filter: object) =>
        (await this.yf_infoRepo.find(filter, '-_id symbol'))
        .map(doc => doc.symbol);

    /**
     * ### ISO_Code 로 조회 => [symbol, price, currency][]
     */
    readPriceByISOcode = async (ISO_Code: string) =>
        this.yf_infoRepo.findPricesByExchange(await this.isoCodeToTimezone(ISO_Code) as string) // TODO - Refac(as)
        .then(arr => arr.map(ele => [ele.symbol, ele.regularMarketLastClose, ele.quoteType === "INDEX" ? "INDEX" : ele.currency]));

    /**
     * ### TODO - Refac
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
                    map(ele => ele.flatMap(this.updatePrice(session))),
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


    private updateStatusPriceByRegularUpdater = (ISO_Code: string, previous_close: string, session: ClientSession) =>
        this.status_priceRepo.findOneAndUpdate(
            { ISO_Code },
            { lastMarketDate: new Date(previous_close).toISOString() },
            session);

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
            each(ele => ele.isRight() ?
            newLogDoc.success.push(ele.getRight) : newLogDoc.failure.push(ele.getLeft)
            )
        );
        const fLen = newLogDoc.failure.length;
        return this.log_priceUpdateRepo.create(newLogDoc, session).then(_ => {
            this.logger.verbose(`${launcher === "scheduler" || launcher === "initiator" ? key : launcher} : Log_priceUpdate Doc Created${fLen ? ` (${fLen} failed)` : ''}`);
        }).catch((error) => {
            this.logger.error(`${launcher} : Failed to Create Log_priceUpdate Doc!!!`);
            throw error;
        });
    }

    // Todo - Refac
    /**
     * ### ISO code 를 yahoofinance exchangeTimezoneName 로 변환 혹은 그 반대를 수행
     * - 없으면 전체 갱신후 재시도
     */
    async isoCodeToTimezone(something: string) {
        const result: string | undefined = await this.cacheManager.get(something);
        if (!result) {
            await this.setIsoCodeToTimezone();
            return await this.cacheManager.get(something) as string | undefined;
        };
        return result;
    }

    setIsoCodeToTimezone = async () => Promise.all(
        (await this.config_exchangeRepo.findAllIsoCodeAndTimezone())
        .map(async isoCodeAndTimezone => {
            await this.cacheManager.set(isoCodeAndTimezone.ISO_Code, isoCodeAndTimezone.ISO_TimezoneName, { ttl: 0 });
            await this.cacheManager.set(isoCodeAndTimezone.ISO_TimezoneName, isoCodeAndTimezone.ISO_Code, { ttl: 0 });
        })
    );

    /**
     * - 1뷴에 한번만 갱신할 수 있도록 ttl 설정
     */
    setIsNotMarketOpen = (ISO_Code: string, isNotMarketOpen: boolean) => this.cacheManager.set(ISO_Code + "_isNotMarketOpen", isNotMarketOpen, { ttl: 60 - new Date().getSeconds() });

    // Todo - Refac(as)
    getIsNotMarketOpen = (ISO_Code: string) => this.cacheManager.get(ISO_Code + "_isNotMarketOpen") as Promise<boolean>;

}