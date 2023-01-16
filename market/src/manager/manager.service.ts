// import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Yf_info, Yf_infoDocument } from '../mongodb/schema/yf_info.schema';
import { YahoofinanceService } from '../yahoofinance/yahoofinance.service';
import { UpdaterService } from '../updater/updater.service';
import { Status_price, Status_priceDocument } from '../mongodb/schema/status_price.schema';
import { ConfigExchangeDto } from './dto/configExchange.dto';
import { Config_exchange, Config_exchangeDocument } from '../mongodb/schema/config_exchange.schema';

@Injectable()
export class ManagerService {

    private readonly logger = new Logger(UpdaterService.name);

    constructor(
        // private readonly configService: ConfigService,
        // private readonly httpService: HttpService,
        @InjectModel(Yf_info.name) private yf_infoModel: Model<Yf_infoDocument>,
        @InjectModel(Status_price.name) private status_priceModel: Model<Status_priceDocument>,
        @InjectModel(Config_exchange.name) private config_exchangeModel: Model<Config_exchangeDocument>,
        private readonly yahoofinanceService: YahoofinanceService,
        private readonly updaterService: UpdaterService,
    ) {}

    /**
     * ### mongoDB 에 신규 자산 생성해보고 그 작업의 결과를 반환
     * - Yf_info 생성
     * - 필요시 Status_price 도 생성
     * - 누더기되서 비효율적임. 리팩토링 필요
     */
    async createByTickerArr(tickerArr: string[]) {
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
            const confirmedTickerArr = [];
            await Promise.all(tickerArr.map(async (ticker) => {
                const exists = await this.yf_infoModel.exists({symbol: ticker})
                if (exists === null) {
                    confirmedTickerArr.push(ticker);
                } else {
                    result.failure.info.push({
                        msg: "Already exists",
                        ticker
                    })
                };
            }))
            if (confirmedTickerArr.length === 0) {
                return result;
            };
            // ---------------------------------------------------------------------------------------------------------

            // info 가져오기
            const infoArr = await this.yahoofinanceService.getSomethingByTickerArr(confirmedTickerArr/*tickerArr*/, "Info");
            // info 분류 (가져오기 성공,실패) + regularMarketLastClose
            const insertArr = [];
            await Promise.all(infoArr.map(async (info) => {
                if (info["error"]) {result.failure.info.push(info);}
                else {
                    const ISO_Code = await this.yahoofinanceService.isoCodeToTimezone(info["exchangeTimezoneName"]);
                    if (ISO_Code === undefined) { // ISO_Code 를 못찾은 경우 실패처리
                        result.failure.info.push({
                            msg: "Could not find ISO_Code",
                            yf_exchangeTimezoneName: info["exchangeTimezoneName"],
                            yfSymbol: info["symbol"]
                        })
                    } else {
                        // regularMarketLastClose
                        const marketSession = await this.updaterService.getSessionSomethingByISOcode(ISO_Code);
                        const isNotMarketOpen = this.updaterService.isNotMarketOpen(marketSession, ISO_Code)
                        if (isNotMarketOpen) {
                            info["regularMarketLastClose"] = info["regularMarketPrice"];
                        } else {
                            info["regularMarketLastClose"] = info["regularMarketPreviousClose"];
                        }
                        insertArr.push(info);
                    }
                };
            }));
            // info 를 mongoDB 에 저장
            await this.yf_infoModel.insertMany(insertArr, {
                ordered: false, // 오류발견해도 중지하지말고 전부 삽입하고 나중에 보고
                // limit: 100
            })
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
                const oldOne = await this.status_priceModel.exists({ yf_exchangeTimezoneName }).exec();
                if (oldOne === null) { // 신규 exchangeTimezoneName!
                    const ISO_Code = await this.yahoofinanceService.isoCodeToTimezone(yf_exchangeTimezoneName) // 불필요?
                    if (ISO_Code === undefined) { // ISO_Code 를 못찾은 경우 실패처리
                        result.failure.status_price.push({
                            msg: "Could not find ISO_Code",
                            yf_exchangeTimezoneName,
                            yfSymbol: info.symbol
                        })
                        /* logger */this.logger.warn(`${info.symbol} : Could not find ISO_Code for ${yf_exchangeTimezoneName}`);
                        return;
                    };
                    const marketSession = await this.updaterService.getSessionSomethingByISOcode(ISO_Code);
                    const lastMarketDate = new Date(marketSession["previous_close"]).toISOString();
                    const newOne = new this.status_priceModel({
                        ISO_Code,
                        lastMarketDate,
                        yf_exchangeTimezoneName,
                    });
                    await newOne.save()
                    .then(async (res)=>{
                        /* logger */this.logger.verbose(`${ISO_Code} : Created new status_price`);
                        result.success.status_price.push(res);
                        // 다음마감 업데이트스케줄 생성해주기
                        this.updaterService.schedulerForPrice(ISO_Code, marketSession)
                    })
                    .catch((error)=>{
                        result.failure.status_price.push({
                            error,
                            yf_exchangeTimezoneName,
                            yfSymbol: info.symbol
                        });
                        /* logger */this.logger.warn(`${info.symbol} : Could not find ISO_Code for ${yf_exchangeTimezoneName}`);
                    })
                }
            }));

            return result;
        } catch (error) {
            throw error;
        }
    }

    /**
     * ### ISO_Code 로 조회 => [ticker, price][]
     */
    async getPriceByISOcode(ISO_Code: string) {
        try {
            const result = [];
            const timezone = await this.yahoofinanceService.isoCodeToTimezone(ISO_Code);
            const priceArr = await this.yf_infoModel.find({exchangeTimezoneName: timezone}, "symbol regularMarketLastClose").exec()
            priceArr.forEach((price)=>{
                result.push([price.symbol, price.regularMarketLastClose]);
            })
            return result;
        } catch (error) {
            throw error;
        };
    }

    /**
     * ### ticker 로 조회 => price
     * - 없는건 생성해서 알려준다
     */
    async getPriceByTicker(ticker: string) {
        try {
            let status_price = undefined;
            const info = await this.yf_infoModel.findOne({symbol: ticker}, "regularMarketLastClose exchangeTimezoneName").exec()
                .then(async res => {
                    if (res === null) {
                        const createResult = await this.createByTickerArr([ticker])
                        if (createResult.failure.info.length > 0) {
                            if (createResult.failure.info[0].error.doc === "Mapping key not found.") {
                                throw new BadRequestException(`Could not find Ticker: ${createResult.failure.info[0].error.ticker}`);
                            }
                            throw new InternalServerErrorException(createResult.failure.info[0]);
                        }
                        status_price = createResult.success.status_price[0]
                        return createResult.success.info[0]
                    } else {
                        return res;
                    }
                }).catch(err => {
                    throw err;
                });
            const ISOcode = await this.yahoofinanceService.isoCodeToTimezone(info.exchangeTimezoneName);
            return {price: info.regularMarketLastClose, ISOcode, status_price};
        } catch (error) {
            throw error;
        };
    }

    /**
     * ### yf_info 조회
     * 
     */
    getYfInfoDoc() {
        try {
            return this.yf_infoModel.find({}, "-_id symbol shortName longName quoteType currency market exchange exchangeTimezoneName exchangeTimezoneShortName").exec();
        } catch (error) {
            throw error;
        }
    }

    /**
     * ### createConfigExchange
     */
    async createConfigExchange(reqBody: ConfigExchangeDto) {
        try {
            const newOne = new this.config_exchangeModel(reqBody);
            return await newOne.save();
        } catch (error) {
            throw error;
        };
    }
}
