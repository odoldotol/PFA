import { Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common";
import { AddAssetsResponse } from "./response/addAssets.response";
import { YfinanceInfoService } from 'src/database/yf_info/yf_info.service';
import { Either } from "src/common/class/either";
import { Database_ExchangeService } from 'src/database/exchange/exchange.service';
import { UpdaterService } from "src/updater/updater.service";
import { ResponseGetPriceByTicker } from "./response/getPriceByTicker.response";
import { Market_FinancialAssetService } from 'src/market/financialAsset/financialAsset.service';
import { Database_FinancialAssetService } from "src/database/financialAsset/financialAsset.service";
import * as F from "@fxts/core";

@Injectable()
export class AssetService {

  private readonly logger = new Logger(AssetService.name);

  constructor(
    private readonly market_financialAssetSrv: Market_FinancialAssetService,
    private readonly database_exchangeSrv: Database_ExchangeService,
    private readonly yfinanceInfoSrv: YfinanceInfoService,
    private readonly database_financialAssetSrv: Database_FinancialAssetService,
    private readonly updaterSrv: UpdaterService,
  ) {}

  // Todo: 에러 핸들링
  public async getPriceByTicker(ticker: string): Promise<ResponseGetPriceByTicker> {
    const asset = await this.database_financialAssetSrv.readOneByPk(ticker);
    if (asset) return new ResponseGetPriceByTicker(asset);
    else {
      const addAssetsRes = await this.addAssets([ticker]);
      if (addAssetsRes.assets[0] === undefined) {
        if (addAssetsRes.failure.pre[0]?.doc === "Mapping key not found.")
          throw new NotFoundException(`Could not find Ticker: ${addAssetsRes.failure.pre[0].ticker}`);
        else throw new InternalServerErrorException(addAssetsRes);
      }
      return new ResponseGetPriceByTicker(addAssetsRes.assets[0], addAssetsRes.exchanges[0]);
    }
  }

  // Todo: Refac
  public getPriceByExchange(ISO_Code: string) {
    return this.database_financialAssetSrv.readManyByExchange(ISO_Code)
    .then(res => res.map(ele => [
      ele.symbol,
      ele.regularMarketLastClose,
      ele.quoteType === "INDEX" ? "INDEX" : ele.currency
    ]));
  }

  // Todo: Refac - 하나의 함수에 지나치게 복잡하게 담겨있음. 별도 서비스 객체로 분리하기.
  // Todo: 모든 거래소에 대해 앱 구동부터 전부 업데이트가 활성화되어있으면 훨씬 로직이 단순해질텐데 처음 설계가 쓸대없이 복잡한것 같은데?
  // Todo: 이미 yf_info 에 존재하는것은 여기서 가져오는게 경제적이긴 한데 지금은 불필요해보임. 추가 고려할것.
  public async addAssets(tickerArr: readonly string[]): Promise<AddAssetsResponse> {
    const failures: any[] = [];

    const dedupStringIterable = (iterable: Iterable<string>): Iterable<string> => new Set(iterable).values();

    const processExistAsset = F.curry((ticker: string, exist: boolean) => {
      if (exist) failures.push({ msg: "Already exists", ticker });
    });

    const isNotExistAsset = async (ticker: string): Promise<boolean> => F.pipe(
      ticker,
      this.database_financialAssetSrv.existByPk.bind(this.database_financialAssetSrv),
      F.tap(processExistAsset(ticker)),
      F.not
    );

    const processFetchFailures = (
      yfInfoEitherArr: Awaited<ReturnType<typeof this.market_financialAssetSrv.fetchInfoArr>>
    ): void => {
      failures.push(...Either.getLeftArray(yfInfoEitherArr));
    };

    //
    const createNewExchanges = (
      fulfilledYfInfoArr: ReturnType<typeof this.market_financialAssetSrv.fulfillYfInfo>[]
    ) => {
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
    };

    // Todo: return type
    const createFinAssets = async (
      fulfilledYfInfoArr: ReturnType<typeof this.market_financialAssetSrv.fulfillYfInfo>[],
      exchangeCreationRes: ReturnType<typeof createNewExchanges>
    ) => {
      const finAssets = fulfilledYfInfoArr.map(e => ({
        symbol: e.symbol,
        quoteType: e.quoteType,
        shortName: e.shortName,
        longName: e.longName,
        exchange: e.marketExchange?.ISO_Code,
        currency: e.currency,
        regularMarketLastClose: e.regularMarketLastClose
      }));
      await exchangeCreationRes
      return this.database_financialAssetSrv.createMany(finAssets).catch(err => err);
      // exchange === undefined 인 경우 추가적인 처리 ?
    };

    const yfInfoArr = await F.pipe(
      tickerArr,
      dedupStringIterable, F.toAsync,
      F.filter(isNotExistAsset),
      F.toArray,
      this.market_financialAssetSrv.fetchInfoArr.bind(this.market_financialAssetSrv),
      F.tap(processFetchFailures),
      Either.getRightArray
    );

    const yfInfoCreationRes = await this.yfinanceInfoSrv.insertMany(yfInfoArr);
    
    const fulfilledYfInfoArr = yfInfoArr.map(this.market_financialAssetSrv.fulfillYfInfo.bind(this.market_financialAssetSrv));

    const exchangeCreationRes = createNewExchanges(fulfilledYfInfoArr);
    const finAssetCreationRes = await createFinAssets(fulfilledYfInfoArr, exchangeCreationRes);

    return new AddAssetsResponse(
      failures,
      yfInfoCreationRes.isLeft() ? yfInfoCreationRes.getLeft.writeErrors : [], // yfInfoFailures
      await exchangeCreationRes,
      finAssetCreationRes
    );
  }

}
