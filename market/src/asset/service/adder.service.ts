import { Injectable, Logger } from "@nestjs/common";
import { AddAssetsResponse } from "../response/addAssets.response";
import { YfinanceInfoService } from 'src/database/yf_info/yf_info.service';
import { Either, eitherWrap } from "src/common/class/either";
import { Market_FinancialAssetService } from 'src/market/financialAsset/financialAsset.service';
import { Database_FinancialAssetService } from "src/database/financialAsset/financialAsset.service";
import { MarketService } from "src/market/market.service";
import * as F from "@fxts/core";
import { TYfInfo } from "src/market/type";
import { dedupStrIter } from "src/common/util";
import { TFulfilledYfInfo } from "src/market/financialAsset/type";
import { FinancialAsset } from "src/database/financialAsset/financialAsset.entity";

@Injectable()
export class AdderService {

  private readonly logger = new Logger(AdderService.name);

  constructor(
    private readonly market_financialAssetSrv: Market_FinancialAssetService,
    private readonly marketSrv: MarketService,
    private readonly yfinanceInfoSrv: YfinanceInfoService,
    private readonly database_financialAssetSrv: Database_FinancialAssetService,
  ) {}

  public async addAssets(tickerArr: readonly string[]): Promise<AddAssetsResponse> {
    return this.addAssetsFromFilteredTickers(await this.filterAddAssetTickers(tickerArr));
  }

  // Todo: 이미 yf_info 에 존재하는것은 yf_info 에서 가져오는게 경제적이긴 한데 지금은 불필요해보임. 추가 고려할것.
  public async addAssetsFromFilteredTickers(
    eitherTickerArr: readonly Either<any, string>[]
  ): Promise<AddAssetsResponse> {

    const eitherYfInfoArr = await this.market_financialAssetSrv.fetchYfInfosByEitherTickerArr(eitherTickerArr);

    const yfInfoArr = Either.getRightArray(eitherYfInfoArr);
    const yfInfoCreationRes = await this.yfinanceInfoSrv.insertMany(yfInfoArr);
    const financialAssetCreationRes = await this.createFinancialAssets(yfInfoArr);

    return new AddAssetsResponse(
      Either.getLeftArray(eitherYfInfoArr),
      yfInfoCreationRes,
      financialAssetCreationRes
    );
  }

  private filterAddAssetTickers(tickerArr: readonly string[]): Promise<Either<any, string>[]> {
    return F.pipe(
      tickerArr,
      dedupStrIter, F.toAsync,
      F.map(this.getEitherTickerWhetherExist.bind(this)),
      F.toArray,
    );
  }

  private async getEitherTickerWhetherExist(ticker: string): Promise<Either<any, string>> {
    return (await this.database_financialAssetSrv.existByPk(ticker))
      ? Either.left({ msg: "Already exists", ticker })
      : Either.right(ticker);
  }

  private async createFinancialAssets(
    yfInfoArr: readonly TYfInfo[],
  ) {
    return eitherWrap(F.pipe(
      yfInfoArr,
      F.map(this.marketSrv.fulfillYfInfo.bind(this.marketSrv)),
      F.peek(this.logNewExchange.bind(this)),
      F.map(this.getFinancialAssetFromFuilfilledYfInfo),
      F.toArray,
      this.database_financialAssetSrv.createMany.bind(this.database_financialAssetSrv),
    ));
  }

  private logNewExchange(e: TFulfilledYfInfo) {
    e.marketExchange ||
    this.logger.warn(`NewExchange: ${e.exchangeName} Ticker: ${e.symbol}`)
  }

  // Todo: 여기 맞아?
  private getFinancialAssetFromFuilfilledYfInfo(e: TFulfilledYfInfo): FinancialAsset {
    return Object.assign({}, e, { exchange: e.marketExchange?.ISO_Code });
  }

}
