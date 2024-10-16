import { Injectable, Logger } from "@nestjs/common";
import {
  YfinanceInfoService,
  Database_FinancialAssetService
} from 'src/database';
import {
  Market_FinancialAssetService
} from 'src/market';
import {
  FinancialAssetCore,
  FulfilledYfInfo,
  MARKET_DATE_DEFAULT,
  Ticker,
} from "src/common/interface";
import { SubscribeAssetsResponse } from "../response";
import { dedupStrIter } from "src/common/util";
import Either, * as E from "src/common/class/either";
import * as F from "@fxts/core";

@Injectable()
export class SubscriberService {

  private readonly logger = new Logger(SubscriberService.name);

  constructor(
    private readonly market_financialAssetSrv: Market_FinancialAssetService,
    private readonly yfinanceInfoSrv: YfinanceInfoService,
    private readonly database_financialAssetSrv: Database_FinancialAssetService,
  ) {}

  public async subscribeAssets(
    tickerArr: readonly Ticker[]
  ): Promise<SubscribeAssetsResponse> {
    return this.subscribeAssetsFromFilteredTickers(
      await this.filterTickersToSubscribe(tickerArr)
    );
  }

  // Todo: 이미 yf_info 에 존재하는것은 yf_info 에서 가져오는게 경제적이긴 한데 지금은 불필요해보임. 추가 고려할것.
  public async subscribeAssetsFromFilteredTickers(
    eitherTickerArr: readonly Either<any, Ticker>[]
  ): Promise<SubscribeAssetsResponse> {

    const eitherYfInfoArr
    = await this.market_financialAssetSrv.fetchYfInfosByEitherTickerArr(eitherTickerArr);

    const yfInfoArr = E.getRightArray(eitherYfInfoArr);
    const yfInfoCreationRes = await this.yfinanceInfoSrv.insertMany(yfInfoArr);

    const fulfilledYfInfoArr = await Promise.all(yfInfoArr.map(this.market_financialAssetSrv.fulfillYfInfo.bind(this.market_financialAssetSrv)));

    const financialAssetCreationRes = await this.createFinancialAssets(E.getRightArray(fulfilledYfInfoArr));

    return new SubscribeAssetsResponse(
      [
        ...E.getLeftArray(eitherYfInfoArr),
        ...E.getLeftArray(fulfilledYfInfoArr)
      ],
      yfInfoCreationRes,
      financialAssetCreationRes
    );
  }

  private filterTickersToSubscribe(
    tickerArr: readonly Ticker[]
  ): Promise<Either<any, Ticker>[]> {
    return F.pipe(
      tickerArr,
      dedupStrIter, F.toAsync,
      F.map(this.getEitherTickerWhetherSubscribed.bind(this)),
      F.toArray,
    );
  }

  private async getEitherTickerWhetherSubscribed(
    ticker: Ticker
  ): Promise<Either<any, Ticker>> {
    return (await this.database_financialAssetSrv.existByPk(ticker)) ?
      Either.left({ msg: "Already exists", ticker }) :
      Either.right(ticker);
  }

  private async createFinancialAssets(
    fulfilledYfInfoArr: readonly FulfilledYfInfo[],
  ) {
    return E.wrapPromise(F.pipe(
      fulfilledYfInfoArr,
      F.peek(this.logNewExchange.bind(this)),
      F.map(this.getFinancialAssetFromFuilfilledYfInfo),
      F.toArray,
      this.database_financialAssetSrv.createMany.bind(this.database_financialAssetSrv),
    ));
  }

  private logNewExchange(e: FulfilledYfInfo) {
    e.marketExchange ||
    this.logger.warn(`NewExchange: ${e.exchangeName} Ticker: ${e.symbol}`);
  }

  // Todo: 여기 맞아?
  private getFinancialAssetFromFuilfilledYfInfo(
    fulfilledYfInfo: FulfilledYfInfo
  ): FinancialAssetCore {
    return {
      symbol: fulfilledYfInfo.symbol,
      quoteType: fulfilledYfInfo.quoteType,
      shortName: fulfilledYfInfo.shortName || null,
      longName: fulfilledYfInfo.longName || null,
      exchange: fulfilledYfInfo.marketExchange?.isoCode || null,
      currency: fulfilledYfInfo.currency,
      regularMarketLastClose: fulfilledYfInfo.regularMarketLastClose,
      regularMarketPreviousClose: fulfilledYfInfo.regularMarketPreviousClose,
      marketDate: fulfilledYfInfo.marketExchange?.marketDate || MARKET_DATE_DEFAULT,
    };
  }

}
