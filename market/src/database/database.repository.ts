import { CACHE_MANAGER, Inject, Injectable, Logger } from "@nestjs/common";
import { Yf_infoRepository } from "./mongodb/repository/yf-info.repository";
import { Status_priceRepository } from "./mongodb/repository/status_price.repository";
import { Config_exchangeRepository } from "./mongodb/repository/config_exchane.repository";
import { Log_priceUpdateRepository } from "./mongodb/repository/log_priceUpdate.repository";
import { ConfigExchangeDto } from "../dto/configExchange.dto";
import { Cache } from 'cache-manager';

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
     * ###
     */
    getAllAssetsInfo() {
        try {
            return this.yf_infoRepo.findAll();
        } catch (error) {
            throw error;
        };
    }

    /**
     * ### ISO_Code 로 조회 => [ticker, price][]
     */
    async getPriceByISOcode(ISO_Code: string) {
        try {
            return this.yf_infoRepo.findPricesByExchange(await this.isoCodeToTimezone(ISO_Code))
            .then(arr => arr.map(ele => [ele.symbol, ele.regularMarketLastClose]));
        } catch (error) {
            throw error;
        };
    }

    /**
     * ###
     */
    getPriceByTicker(ticker: string) {
        try {
            return this.yf_infoRepo.findPriceBySymbol(ticker);
        } catch (error) {
            throw error;
        };
    }

    /**
     * ###
     */
    testPickAsset(exchangeTimezoneName: string) {
        try {
            return this.yf_infoRepo.testPickOne(exchangeTimezoneName);
        } catch (error) {
            throw error;
        };
    }

    /**
     * ###
     * - updater.service.updatePriceByTickerArr
     */
    async updatePriceByArr(tickerArr: string[], priceArr: object[], lastClose: "regularMarketPreviousClose" | "regularMarketPrice") {
        try {
            const result = {success: [], failure: []};

            await Promise.all(tickerArr.map((ticker, idx) => {
                if (priceArr[idx]["error"]) {
                    priceArr[idx]['ticker'] = ticker;
                    result.failure.push(priceArr[idx]);
                } else {
                    const regularMarketPreviousClose = priceArr[idx]["regularMarketPreviousClose"];
                    const regularMarketPrice = priceArr[idx]["regularMarketPrice"];
                    const regularMarketLastClose = priceArr[idx][lastClose];
                    priceArr[idx]["regularMarketLastClose"] = regularMarketLastClose;

                    return this.yf_infoRepo.updatePrice(
                        ticker,
                        {regularMarketPreviousClose, regularMarketPrice, regularMarketLastClose}
                    )
                    .then((res)=>{
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
                            ) /* 예외 케이스가 발견됨에 따라 수정해야항 수도 있음 */ {
                            result.success.push([ticker, priceArr[idx]]);
                        } else {
                            result.failure.push({error: "updateOne error", ticker, res});
                        }
                    })
                    .catch(error => {
                        result.failure.push({error, ticker});
                    });
                };
            }));
            
            return result;
        } catch (error) {
            throw error;
        };
    }

    /**
     * ###
     * - updater.service.updatePriceByFilters
     */
    async getSymbolArr(filter: object) {
        try {
            return (await this.yf_infoRepo.find(filter, '-_id symbol')).map(doc => doc.symbol);
        } catch (error) {
            throw error;
        };
    }

    /**
     * ###
     */
    existsAssetByTicker(ticker: string) {
        try {
            return this.yf_infoRepo.exists(ticker);
        } catch (error) {
            throw error;
        };
    }

    /**
     * ###
     */
    insertAssets(assetArr) {
        try {
            return this.yf_infoRepo.insertMany(assetArr);
        } catch (error) {
            throw error;
        };
    }

    /**
     * ###
     */
    getAllStatusPrice() {
        try {
            return this.status_priceRepo.findAll();
        } catch (error) {
            throw error;
        };
    }

    getStatusPrice(ISO_Code: string) {
        try {
            return this.status_priceRepo.findOneByISOcode(ISO_Code);
        } catch (error) {
            throw error;
        };
    }

    /**
     * ###
     */
    updateStatusPriceByRegularUpdater(ISO_Code: string, previous_close: string) {
        try {
            return this.status_priceRepo.updateByRegularUpdater(ISO_Code, previous_close);
        } catch (error) {
            throw error;
        };
    }

    /**
     * ###
     */
    existsStatusPrice(filter: object) {
        try {
            return this.status_priceRepo.exists(filter);
        } catch (error) {
            throw error;
        };
    }

    /**
     * ###
     */
    createStatusPrice(ISO_Code: string, previous_close: string, yf_exchangeTimezoneName: string) {
        try {
            return this.status_priceRepo.createOne(
                ISO_Code,
                new Date(previous_close).toISOString(),
                yf_exchangeTimezoneName
            );
        } catch (err) {
            throw err
        };
    }

    /**
     * ###
     */
    createConfigExchange(body: ConfigExchangeDto) {
        try {
            return this.config_exchangeRepo.createOne(body);
        } catch (error) {
            throw error;
        };
    }

    /**
     * ###
     */
    getMarginMilliseconds(ISO_Code: string) {
        try {
            return this.config_exchangeRepo.findMarginMilliseconds(ISO_Code);
        } catch (error) {
            throw error;
        };
    }

    /**
     * ###
     */
    testPickLastUpdateLog(ISO_Code: string) {
        try {
            return this.log_priceUpdateRepo.testPickLastOne(ISO_Code);
        } catch (error) {
            throw error;
        };
    }

    /**
     * ### log_priceUpdate Doc 생성 By launcher, updateResult, key
     */
    createLogPriceUpdate(launcher: string, updateResult, key: string | Array<string | Object>) {
        try {
            this.log_priceUpdateRepo.create(launcher, updateResult, key)
            .then(() => {
                if (launcher === "scheduler" || launcher === "initiator") {
                    /* logger */this.logger.verbose(`${key} : Log_priceUpdate Doc Created`)
                } else {
                    /* logger */this.logger.verbose(`Log_priceUpdate Doc Created : ${launcher}`)
                }
            })
            .catch((error) => {
                /* logger */this.logger.error(error)
            })
        } catch (error) {
            throw error
        };
    }

    /**
     * ### ISO code 를 yahoofinance exchangeTimezoneName 로 변환 혹은 그 반대를 수행
     * - 없으면 전체 갱신후 재시도
     */
    async isoCodeToTimezone(something: string): Promise<string> {
        try {
            const result: string = await this.cacheManager.get(something);
            if (!result) {
                await this.setIsoCodeToTimezone();
                return await this.cacheManager.get(something);
            };
            return result;
        } catch (error) {
            throw error;
        };
    }

    /**
     * isoCodeToTimezone 갱신
     */
    async setIsoCodeToTimezone() {
        try {
            await Promise.all((await this.config_exchangeRepo.findAllIsoCodeAndTimezone()).map(async isoCodeAndTimezone => {
                await this.cacheManager.set(isoCodeAndTimezone.ISO_Code, isoCodeAndTimezone.ISO_TimezoneName);
                await this.cacheManager.set(isoCodeAndTimezone.ISO_TimezoneName, isoCodeAndTimezone.ISO_Code);
            }));
        } catch (error) {
            throw error;
        };
    }

}