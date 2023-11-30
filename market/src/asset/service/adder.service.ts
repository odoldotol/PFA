import { Injectable, Logger } from "@nestjs/common";
import { AddAssetsResponse } from "../response/addAssets.response";
import { YfinanceInfoService } from 'src/database/yf_info/yf_info.service';
import { Either } from "src/common/class/either";
import { Database_ExchangeService } from 'src/database/exchange/exchange.service';
import { UpdaterService } from "./updater.service";
import { Market_FinancialAssetService } from 'src/market/financialAsset/financialAsset.service';
import { Database_FinancialAssetService } from "src/database/financialAsset/financialAsset.service";
import { MarketService } from "src/market/market.service";
import * as F from "@fxts/core";

// Todo: NewExchange 리팩터링 후에 여기도 리팩터링하기
@Injectable()
export class AdderService {

  private readonly logger = new Logger(AdderService.name);

  constructor(
    private readonly market_financialAssetSrv: Market_FinancialAssetService,
    private readonly marketSrv: MarketService,
    private readonly database_exchangeSrv: Database_ExchangeService,
    private readonly yfinanceInfoSrv: YfinanceInfoService,
    private readonly database_financialAssetSrv: Database_FinancialAssetService,
    private readonly updaterSrv: UpdaterService,
  ) {}

  // Todo: Refac - Exchange 리팩터링 후에 NewExchange 다룰 필요 없어질것임. 그 후 리팩터링하기
  // Todo: 이미 yf_info 에 존재하는것은 yf_info 에서 가져오는게 경제적이긴 한데 지금은 불필요해보임. 추가 고려할것.
  public async addAssets(tickerArr: readonly string[]): Promise<AddAssetsResponse> {

    const eitherYfInfoArr = await F.pipe(
      tickerArr,
      this.dedupStringIterable, F.toAsync,
      F.map(this.getEitherTickerWhetherExistDatabase_financialAsset.bind(this)),
      F.toArray,
      this.market_financialAssetSrv.fetchYfInfosByEitherTickerArr.bind(this.market_financialAssetSrv),
    );
    const yfInfoArr = Either.getRightArray(eitherYfInfoArr);
    const generalFailureArr = Either.getLeftArray(eitherYfInfoArr);

    const yfInfoCreationRes = await this.yfinanceInfoSrv.insertMany(yfInfoArr);

    const fulfilledYfInfoArr = yfInfoArr.map(
      this.marketSrv.fulfillYfInfo.bind(this.marketSrv)
    );
    
    const newExchangeCreationResPromise = this.createNewExchanges(fulfilledYfInfoArr); // 삭제될 예정
    const financialAssetCreationRes = await this.createFinAssets(
      fulfilledYfInfoArr,
      newExchangeCreationResPromise
    );

    return new AddAssetsResponse(
      generalFailureArr,
      yfInfoCreationRes.isLeft() ? yfInfoCreationRes.getLeft.writeErrors : [],
      await newExchangeCreationResPromise,
      financialAssetCreationRes
    );
  }

  // Todo: utill?
  private dedupStringIterable(iterable: Iterable<string>): Iterable<string> {
    return new Set(iterable).values();
  }

  private async getEitherTickerWhetherExistDatabase_financialAsset(ticker: string): Promise<Either<any, string>> {
    return (await this.database_financialAssetSrv.existByPk(ticker))
      ? Either.left({ msg: "Already exists", ticker })
      : Either.right(ticker);
  }

  // Todo: Exchange 리팩터링 후에 NewExchange 다룰 필요 없어질것임
  private createNewExchanges(
    fulfilledYfInfoArr: ReturnType<typeof this.marketSrv.fulfillYfInfo>[]
  ) {
    const newExchangeMap = new Map(
      fulfilledYfInfoArr
      .filter(ele => ele.marketExchange?.getIsRegisteredUpdater() === false)
      .map(ele => [ ele.marketExchange!.ISO_Code, ele.marketExchange! ])
    );

    const createOneAndRegisterUpdater = async (
      exchange: typeof newExchangeMap extends Map<infer K, infer V> ? V : never
    ) => {
      const exchangeCreationEither = await this.database_exchangeSrv.createOne({
        ISO_Code: exchange.ISO_Code,
        ISO_TimezoneName: exchange.ISO_TimezoneName,
        marketDate: exchange.getMarketDateYmdStr()
      })
      .then(res => Either.right<any, typeof res>(res))
      .catch(err => Either.left<any, Awaited<ReturnType<typeof this.database_exchangeSrv.createOne>>>(err));
      
      exchangeCreationEither.isRight() && this.updaterSrv.registerExchangeUpdater(exchangeCreationEither.getRight);
      return exchangeCreationEither;
    };

    return Promise.all([...newExchangeMap.values()].map(createOneAndRegisterUpdater));
  }

  // Todo: databaseModule?
  // Todo: return type
  private async createFinAssets(
    fulfilledYfInfoArr: ReturnType<typeof this.marketSrv.fulfillYfInfo>[],
    exchangeCreationRes: ReturnType<typeof this.createNewExchanges>
  ) {
    const finAssets = fulfilledYfInfoArr.map(e => {
      let exchange: string | undefined;
      e.marketExchange
        ? exchange = e.marketExchange.ISO_Code
        : this.logger.warn(`NewExchange: ${e.exchangeName} Ticker: ${e.symbol}`);
      // Todo: exchange === undefined 인 경우가 이제 진짜 NewExchange 인 경우가 된다.
      return {
        symbol: e.symbol,
        quoteType: e.quoteType,
        shortName: e.shortName,
        longName: e.longName,
        exchange,
        currency: e.currency,
        regularMarketLastClose: e.regularMarketLastClose
      }
    });
    await exchangeCreationRes
    return this.database_financialAssetSrv.createMany(finAssets).catch(err => err);
  }

}
