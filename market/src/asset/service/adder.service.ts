import { Injectable, Logger } from "@nestjs/common";
import { AddAssetsResponse } from "../response/addAssets.response";
import { YfinanceInfoService } from 'src/database/yf_info/yf_info.service';
import { Either } from "src/common/class/either";
import { Market_FinancialAssetService } from 'src/market/financialAsset/financialAsset.service';
import { Database_FinancialAssetService } from "src/database/financialAsset/financialAsset.service";
import { MarketService } from "src/market/market.service";
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

  // Todo: 이미 yf_info 에 존재하는것은 yf_info 에서 가져오는게 경제적이긴 한데 지금은 불필요해보임. 추가 고려할것.
  public async addAssets(tickerArr: readonly string[]): Promise<AddAssetsResponse> {

    const eitherYfInfoArr = await F.pipe(
      tickerArr,
      this.dedupStringIterable, F.toAsync,
      F.map(this.getEitherTickerWhetherExist.bind(this)),
      F.toArray,
      this.market_financialAssetSrv.fetchYfInfosByEitherTickerArr.bind(this.market_financialAssetSrv),
    );
    const yfInfoArr = Either.getRightArray(eitherYfInfoArr);
    const generalFailureArr = Either.getLeftArray(eitherYfInfoArr);

    const yfInfoCreationRes = await this.yfinanceInfoSrv.insertMany(yfInfoArr);

    const fulfilledYfInfoArr = yfInfoArr.map(
      this.marketSrv.fulfillYfInfo.bind(this.marketSrv)
    );
    
    const financialAssetCreationRes = await this.createFinancialAssets(fulfilledYfInfoArr);

    return new AddAssetsResponse(
      generalFailureArr,
      yfInfoCreationRes.isLeft() ? yfInfoCreationRes.left.writeErrors : [],
      financialAssetCreationRes
    );
  }

  // Todo: utill?
  private dedupStringIterable(iterable: Iterable<string>): Iterable<string> {
    return new Set(iterable).values();
  }

  private async getEitherTickerWhetherExist(ticker: string): Promise<Either<any, string>> {
    return (await this.database_financialAssetSrv.existByPk(ticker))
      ? Either.left({ msg: "Already exists", ticker })
      : Either.right(ticker);
  }

  // Todo: Refac - return type
  private async createFinancialAssets(
    fulfilledYfInfoArr: ReturnType<typeof this.marketSrv.fulfillYfInfo>[],
  ) {
    const finAssets = fulfilledYfInfoArr.map(e => {
      let exchange: string | undefined;
      e.marketExchange
        ? exchange = e.marketExchange.ISO_Code
        // Todo: NewExchange 인 경우
        : this.logger.warn(`NewExchange: ${e.exchangeName} Ticker: ${e.symbol}`);
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
    return this.database_financialAssetSrv.createMany(finAssets).catch(err => err);
  }

}
