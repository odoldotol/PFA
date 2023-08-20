import { Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common";
import { AddAssetsResponse } from "src/updater/response/addAssets.response";
import * as F from "@fxts/core";
import { MarketService } from "src/market/market.service";
import { ConfigService } from "@nestjs/config";
import { EnvironmentVariables } from "src/common/interface/environmentVariables.interface";
import { EnvKey } from "src/common/enum/envKey.emun";
import { Yf_infoService as DbYfInfoService } from 'src/database/yf_info/yf_info.service';
import { Either } from "src/common/class/either";
import { ExchangeService as MkExchangeService } from 'src/market/exchange.service';
import { ExchangeService as DbExchangeService } from 'src/database/exchange/exchange.service';
import { UpdaterService } from "src/updater/updater.service";
import { Exchange as ExchangeEntity } from 'src/database/exchange/exchange.entity';
import { TExchangeCore } from "src/common/type/exchange.type";
import { ResponseGetPriceByTicker } from "src/app/response/getPriceByTicker.response";
import { exchangeConfigArr } from "src/config/const/exchanges.const";
import { DBRepository } from "src/database/database.repository";

@Injectable()
export class AssetService {

  private readonly logger = new Logger(AssetService.name);
  private readonly CHILD_CONCURRENCY = this.configSrv.get(EnvKey.Child_concurrency, 1, { infer: true }) * 50;

  constructor(
    private readonly configSrv: ConfigService<EnvironmentVariables>,
    private readonly marketSrv: MarketService,
    private readonly mkExchangeSrv: MkExchangeService,
    private readonly dbExchangeSrv: DbExchangeService,
    private readonly dbYfInfoSrv: DbYfInfoService,
    private readonly updaterSrv: UpdaterService,
    private readonly dbRepo: DBRepository,
  ) {}

    // TODO - Refac
    async getPriceByTicker(ticker: string) {
      let status_price: TExchangeCore | undefined = undefined; // Todo: Refac
      const price: FulfilledYfInfo = await this.dbYfInfoSrv.findPriceBySymbol(ticker)
      .then(async res => {
          if (res === null) {
              const createResult = await this.addAssets([ticker])
              if (createResult.failure.info.length > 0) {
                  if (createResult.failure.info[0].doc === "Mapping key not found.") {
                      throw new NotFoundException(`Could not find Ticker: ${createResult.failure.info[0].ticker}`);
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
      return new ResponseGetPriceByTicker(
          price.regularMarketLastClose,
          exchangeConfigArr.find(ele => ele.ISO_TimezoneName === price.exchangeTimezoneName)!.ISO_Code, // exchange 리팩터링 후 문제
          price.quoteType === "INDEX" ? "INDEX" : price.currency,
          status_price);
  }

  getPriceByExchange = this.dbRepo.readPriceByISOcode;

  // TODO: Refac - 기능 분리
  // Todo: Refac - Exchange 리팩터링 후 아직 함께 이팩터링되지 못함
  addAssets = async (tickerArr: string[]) => {
    const response = new AddAssetsResponse();
    const spMap: Map<string, string[]> = new Map();

    await F.pipe( // 중복제거와 exists필터 부분은 단일 티커처리시 필요없음. 이 부분 보완하기
      new Set(tickerArr).values(), F.toAsync,
      F.map(this.eitherFilter_existsAsset),
      F.map(ele => ele.flatMap(this.marketSrv.fetchInfo.bind(this.marketSrv))),
      F.map(ele => ele.flatMap(this.fulfillYfInfo.bind(this))),
      F.filter(ele => ele.isLeft() ? (response.failure.info.push(ele.getLeft), false) : true),
      F.map(ele => ele.getRight),
      F.concurrent(this.CHILD_CONCURRENCY),
      F.toArray,
      F.tap(arr => this.dbYfInfoSrv.insertMany(arr)
        .then(res => response.success.info = res)
        .catch(err => (response.failure.info = response.failure.info.concat(err.writeErrors),
          response.success.info = response.success.info.concat(err.insertedDocs)))),
      F.each(ele => spMap.has(ele.exchangeTimezoneName) ?
        spMap.get(ele.exchangeTimezoneName)?.push(ele.symbol) // ?
        : spMap.set(ele.exchangeTimezoneName, [ele.symbol])));
    await F.pipe(
      spMap, F.toAsync,
      F.filter(this.isNewExchange.bind(this)),
      F.map(this.applyNewExchange),
      F.each(ele => ele.isRight() ?
      // @ts-ignore // exchange 리팩터링 후 문제
        response.success.status_price.push(ele.getRight)
        : response.failure.status_price.push(ele.getLeft)));
    return response;
  };

  private eitherFilter_existsAsset = async (ticker: string): Promise<Either<any, string>> =>
    (await this.dbYfInfoSrv.exists(ticker) === null) ?
      Either.right(ticker) : Either.left({ msg: "Already exists", ticker });

  // Todo: Refac - Exchange 리팩터링 후 억지로 끼워맞춤
  private fulfillYfInfo = async (info: YfInfo): Promise<Either<any, FulfilledYfInfo>> => {
    const exchange = this.mkExchangeSrv.findExchange(info.exchangeTimezoneName)! //
    const ISO_Code = exchange.ISO_Code; //
    return ISO_Code === undefined ?
      Either.left({
        msg: "Could not find ISO_Code",
        yf_exchangeTimezoneName: info.exchangeTimezoneName,
        yfSymbol: info.symbol
      })
      : Either.right({
        ...info,
        regularMarketLastClose: !exchange.isMarketOpen() ? info.regularMarketPrice : info.regularMarketPreviousClose
      })
  };

  private async isNewExchange([yf_exchangeTimezoneName, _]: [string, string[]]) {
    return !(await this.dbExchangeSrv.exist({ ISO_TimezoneName: yf_exchangeTimezoneName }));
  }

  // TODO - Refac
  // Todo: Refac - Exchange 리팩터링 후 억지로 끼워맞춤
  private applyNewExchange = async ([yf_exchangeTimezoneName, symbolArr]: [string, string[]]): Promise<Either<any, ExchangeEntity>> => {
    const exchange = this.mkExchangeSrv.findExchange(yf_exchangeTimezoneName)! //
    const ISO_Code = exchange.ISO_Code; //
    if (ISO_Code === undefined) {
      this.logger.error(`${symbolArr[0]} : Could not find ISO_Code for ${yf_exchangeTimezoneName}`);
      return Either.left({
        msg: "Could not find ISO_Code",
        yf_exchangeTimezoneName,
        symbol: symbolArr
      });
    } else {
      return await this.dbExchangeSrv.createOne({
        ISO_Code,
        ISO_TimezoneName: yf_exchangeTimezoneName,
        marketDate: exchange.getMarketDate().toISOString()
      }).then(async res => {
        this.logger.verbose(`${ISO_Code} : Created new Exchange`);
        this.mkExchangeSrv.registerUpdater(this.updaterSrv.updateAssetsOfExchange.bind(this.updaterSrv), res);
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
  };

}