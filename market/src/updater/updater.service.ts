import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { MarketService } from 'src/market/market.service';
import { DBRepository } from 'src/database/database.repository';
import { ProductApiService } from 'src/product-api/product-api.service';
import { AddAssetsResponse } from './response/addAssets.response';
import { Either } from "src/common/class/either";
import { pipe, map, toArray, toAsync, tap, each, filter, concurrent, curry } from "@fxts/core"; // Todo: 제거
import * as F from "@fxts/core";
import { EnvironmentVariables } from 'src/common/interface/environmentVariables.interface';
import { EnvKey } from 'src/common/enum/envKey.emun';
import { UpdatePriceResult } from 'src/common/interface/updatePriceResult.interface';
import { ExchangeService as MkExchangeService } from 'src/market/exchange.service';
import { ExchangeService as DbExchangeService } from 'src/database/exchange/exchange.service';
import { FinancialAssetService as DbFinancialAssetService } from 'src/database/financialAsset/financialAsset.service';
import { Yf_infoService as DbYfInfoService } from 'src/database/yf_info/yf_info.service';
import { Exchange } from 'src/market/class/exchange';
import { Exchange as ExchangeEntity } from 'src/database/exchange/exchange.entity';

/**
 * ### TODO: Refac:
 * 스케쥴러, 가격 업데이트, Asset 생성, 이니시에이터 등으로 모듈 또는 프로바이더를 적절히 나누기
 */
@Injectable()
export class UpdaterService implements OnModuleInit {

  private readonly logger = new Logger(UpdaterService.name);
  private readonly TEMP_KEY = this.configService.get(EnvKey.TempKey, 'TEMP_KEY', { infer: true });
  private readonly CHILD_CONCURRENCY = this.configService.get(EnvKey.Child_concurrency, 1, { infer: true }) * 50;

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly mkExchangeSrv: MkExchangeService,
    private readonly marketService: MarketService,
    private readonly dbRepo: DBRepository,
    private readonly dbExchangeSrv: DbExchangeService,
    private readonly dbFinAssetSrv: DbFinancialAssetService,
    private readonly dbYfInfoSrv: DbYfInfoService,
    private readonly productApiSvc: ProductApiService
  ) {}

  async onModuleInit() {
    await F.pipe(
      this.dbExchangeSrv.readAll(), F.toAsync,
      F.peek(this.mkExchangeSrv.registerUpdater.bind(
        this.mkExchangeSrv,
        this.updateAssetsOfExchange.bind(this)
      )),
      F.filter(this.mkExchangeSrv.shouldUpdate.bind(this.mkExchangeSrv)),
      F.map(this.mkExchangeSrv.fulfillUpdater.bind(
        this.mkExchangeSrv,
        this.updateAssetsOfExchange.bind(this))
      ),
      F.each(updater => updater("initiator"))
    );
  }


  // ------------ Legacy -----------------------------------------------------

  // Deprecated
  public getAllSchedule() {
    const result: { [key: string]: any } = {};
    this.schedulerRegistry.getCronJobs().forEach((v, k) => {
      let nextDate: string, lastDate: string
      try {
        nextDate = v.nextDate().toUTC().toJSDate().toISOString();
        lastDate = v.lastDate()?.toISOString();
      } catch (error) {
        this.logger.warn(error);
        nextDate = "Calculating...";
        lastDate = "Calculating...";
      }
      result[k] = {
        nextDate,
        lastDate,
        running: v.running,
      };
    });
    return result;
  }

  // Todo: Refac - Exchange 리팩터링 후 억지로 끼워맞춤
  public async updateAssetsOfExchange(exchange: Exchange, launcher: LogPriceUpdate["launcher"]) {
    const ISO_Code = exchange.ISO_Code;
    const yf_exchangeTimezoneName = exchange.ISO_TimezoneName;
    const previous_close = exchange.getMarketDate().toISOString();
    const isNotMarketOpen = !exchange.isMarketOpen();

    this.logger.log(`${ISO_Code} : Updater Run!!!`);
    const startTime = new Date().toISOString();
    await this.dbRepo.updatePriceStandard(
      await pipe(
        this.dbRepo.readSymbolArr({ exchangeTimezoneName: yf_exchangeTimezoneName }), toAsync,
        map(this.marketService.fetchPrice.bind(this.marketService)),
        map(ele => ele.map(this.fulfillUpdatePriceSet(isNotMarketOpen))),
        concurrent(this.CHILD_CONCURRENCY),
        toArray
      ),
      ISO_Code,
      previous_close,
      startTime,
      launcher
    ).then(updateResult => {
      this.logger.log(`${ISO_Code} : Updater End!!!`);
      this.regularUpdater(ISO_Code, previous_close, updateResult.updatePriceResult);
    }).catch(_ => {
      this.logger.log(`${ISO_Code} : Updater Failed!!!`);
    });
  }

  private fulfillUpdatePriceSet = curry((
    isNotMarketOpen: boolean,
    { symbol, regularMarketPreviousClose, regularMarketPrice }: YfPrice
  ): UpdatePriceSet => [symbol, {
    regularMarketPreviousClose,
    regularMarketPrice,
    regularMarketLastClose: isNotMarketOpen ? regularMarketPrice : regularMarketPreviousClose
  }]);

  // Todo: Refac - Exchange 리팩터링 후 아직 함께 이팩터링되지 못함
  private regularUpdater(
    ISO_Code: string,
    previous_close: string,
    updatePriceResult: UpdatePriceResult
  ) {
    const marketDate = previous_close.slice(0, 10);
    const priceArrs = pipe(
      updatePriceResult,
      filter(ele => ele.isRight()),
      map(ele => ele.getRight),
      map(ele => [ele[0], ele[1].regularMarketLastClose] as [string, number]),
      toArray
    );
    const rq = async (retry: boolean = false) => {
      try {
        retry && this.schedulerRegistry.deleteCronJob(ISO_Code + "_requestRegularUpdater");
        this.logger.verbose(`${ISO_Code} : RegularUpdater Product Response status ${await this.productApiSvc.updatePriceByExchange(ISO_Code, this.addKey({ marketDate, priceArrs }))
          }`);
      } catch (error) {
        this.logger.error(error);
        if (retry) this.logger.warn(`${ISO_Code} : RequestRegularUpdater Failed`);
        else {
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
  };

  // TODO: Refac - 기능 분리
  // Todo: Refac - Exchange 리팩터링 후 아직 함께 이팩터링되지 못함
  addAssets = async (tickerArr: string[]) => {
    const response = new AddAssetsResponse();
    const spMap: Map<string, string[]> = new Map();

    await pipe( // 중복제거와 exists필터 부분은 단일 티커처리시 필요없음. 이 부분 보완하기
      new Set(tickerArr).values(), toAsync,
      map(this.eitherFilter_existsAsset),
      map(ele => ele.flatMap(this.marketService.fetchInfo.bind(this.marketService))),
      map(ele => ele.flatMap(this.fulfillYfInfo.bind(this))),
      filter(ele => ele.isLeft() ? (response.failure.info.push(ele.getLeft), false) : true),
      map(ele => ele.getRight),
      concurrent(this.CHILD_CONCURRENCY),
      toArray,
      tap(arr => this.dbYfInfoSrv.insertMany(arr)
        .then(res => response.success.info = res)
        .catch(err => (response.failure.info = response.failure.info.concat(err.writeErrors),
          response.success.info = response.success.info.concat(err.insertedDocs)))),
      each(ele => spMap.has(ele.exchangeTimezoneName) ?
        spMap.get(ele.exchangeTimezoneName)?.push(ele.symbol) // ?
        : spMap.set(ele.exchangeTimezoneName, [ele.symbol])));
    await pipe(
      spMap, toAsync,
      filter(this.isNewExchange.bind(this)),
      map(this.applyNewExchange),
      each(ele => ele.isRight() ?
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
        this.mkExchangeSrv.registerUpdater(this.updateAssetsOfExchange.bind(this), res);
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

  // @ts-ignore
  addKey = <T>(body: T) => (body["key"] = this.TEMP_KEY, body);

}
