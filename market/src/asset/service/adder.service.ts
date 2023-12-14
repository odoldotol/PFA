import { Injectable, Logger } from "@nestjs/common";
import { YfinanceInfoService } from 'src/database/yf_info/yf_info.service';
import {
  Market_FinancialAssetService
} from 'src/market/financialAsset/financialAsset.service';
import {
  Database_FinancialAssetService
} from "src/database/financialAsset/financialAsset.service";
import { MarketService } from "src/market/market.service";
import { FinancialAsset } from "src/database/financialAsset/financialAsset.entity";
import {
  FulfilledYfInfo,
  Ticker,
  YfInfo
} from "src/common/interface";
import { AddAssetsResponse } from "../response/addAssets.response";
import { dedupStrIter } from "src/common/util";
import Either, * as E from "src/common/class/either";
import * as F from "@fxts/core";

@Injectable()
export class AdderService {

  private readonly logger = new Logger(AdderService.name);

  constructor(
    private readonly market_financialAssetSrv: Market_FinancialAssetService,
    private readonly marketSrv: MarketService,
    private readonly yfinanceInfoSrv: YfinanceInfoService,
    private readonly database_financialAssetSrv: Database_FinancialAssetService,
  ) {}

  public async addAssets(
    tickerArr: readonly Ticker[]
  ): Promise<AddAssetsResponse> {
    return this.addAssetsFromFilteredTickers(
      await this.filterAddAssetTickers(tickerArr)
    );
  }

  // Todo: 이미 yf_info 에 존재하는것은 yf_info 에서 가져오는게 경제적이긴 한데 지금은 불필요해보임. 추가 고려할것.
  public async addAssetsFromFilteredTickers(
    eitherTickerArr: readonly Either<any, Ticker>[]
  ): Promise<AddAssetsResponse> {

    const eitherYfInfoArr
    = await this.market_financialAssetSrv.fetchYfInfosByEitherTickerArr(eitherTickerArr);

    const yfInfoArr = E.getRightArray(eitherYfInfoArr);
    const yfInfoCreationRes = await this.yfinanceInfoSrv.insertMany(yfInfoArr);
    const financialAssetCreationRes = await this.createFinancialAssets(yfInfoArr);

    return new AddAssetsResponse(
      E.getLeftArray(eitherYfInfoArr),
      yfInfoCreationRes,
      financialAssetCreationRes
    );
  }

  private filterAddAssetTickers(
    tickerArr: readonly Ticker[]
  ): Promise<Either<any, Ticker>[]> {
    return F.pipe(
      tickerArr,
      dedupStrIter, F.toAsync,
      F.map(this.getEitherTickerWhetherExist.bind(this)),
      F.toArray,
    );
  }

  private async getEitherTickerWhetherExist(
    ticker: Ticker
  ): Promise<Either<any, Ticker>> {
    return (await this.database_financialAssetSrv.existByPk(ticker)) ?
      Either.left({ msg: "Already exists", ticker }) :
      Either.right(ticker);
  }

  private async createFinancialAssets(
    yfInfoArr: readonly YfInfo[],
  ) {
    return E.wrapPromise(F.pipe(
      yfInfoArr,
      F.map(this.marketSrv.fulfillYfInfo.bind(this.marketSrv)),
      F.peek(this.logNewExchange.bind(this)),
      F.map(this.getFinancialAssetFromFuilfilledYfInfo),
      F.toArray,
      this.database_financialAssetSrv.createMany.bind(this.database_financialAssetSrv),
    ));
  }

  private logNewExchange(e: FulfilledYfInfo) {
    e.marketExchange ||
    this.logger.warn(`NewExchange: ${e.exchangeName} Ticker: ${e.symbol}`)
  }

  // Todo: 여기 맞아?
  private getFinancialAssetFromFuilfilledYfInfo(
    fulfilledYfInfo: FulfilledYfInfo
  ): FinancialAsset {
    return {
      symbol: fulfilledYfInfo.symbol,
      quoteType: fulfilledYfInfo.quoteType,
      shortName: fulfilledYfInfo.shortName,
      longName: fulfilledYfInfo.longName,
      exchange: fulfilledYfInfo.marketExchange?.isoCode,
      currency: fulfilledYfInfo.currency,
      regularMarketLastClose: fulfilledYfInfo.regularMarketLastClose,
    };
  }

}
