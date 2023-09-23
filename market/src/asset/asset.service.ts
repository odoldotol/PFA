import { Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common";
import { AddAssetsResponse } from "./response/addAssets.response";
import { Yf_infoService as DbYfInfoService } from 'src/database/yf_info/yf_info.service';
import { Either } from "src/common/class/either";
import { ExchangeService as DbExchangeService } from 'src/database/exchange/exchange.service';
import { UpdaterService } from "src/updater/updater.service";
import { ResponseGetPriceByTicker } from "./response/getPriceByTicker.response";
import { AssetService as MkAssetService } from 'src/market/asset/asset.service';
import { FinancialAssetService as DbFinancialAssetService } from "src/database/financialAsset/financialAsset.service";
import * as F from "@fxts/core";

@Injectable()
export class AssetService {

  private readonly logger = new Logger(AssetService.name);

  constructor(
    private readonly mkAssetSrv: MkAssetService,
    private readonly dbExchangeSrv: DbExchangeService,
    private readonly dbYfInfoSrv: DbYfInfoService,
    private readonly dbFinAssetSrv: DbFinancialAssetService,
    private readonly updaterSrv: UpdaterService,
  ) {}

  // Todo: 에러 핸들링
  public async getPriceByTicker(ticker: string) {
    const asset = await this.dbFinAssetSrv.readOneByPk(ticker);
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
    return this.dbFinAssetSrv.readManyByExchange(ISO_Code)
    .then(res => res.map(ele => [
      ele.symbol,
      ele.regularMarketLastClose,
      ele.quoteType === "INDEX" ? "INDEX" : ele.currency
    ]));
  }

  // Todo: Refac
  // Todo: 모든 거래소에 대해 앱 구동부터 전부 업데이트가 활성화되어있으면 훨씬 로직이 단순해질텐데 처음 설계가 쓸대없이 복잡한것 같은데?
  public async addAssets(tickerArr: string[]) {

    const failures: any[] = [];

    const deduplicate = <T>(iterable: Iterable<T>) => new Set(iterable).values();

    const processExistAsset = F.curry((ticker: string, exist: boolean) => {
      if (exist) failures.push({ msg: "Already exists", ticker });
    });

    const isNotExistAsset = async (ticker: string) => F.pipe(
      ticker,
      this.dbFinAssetSrv.existByPk.bind(this.dbFinAssetSrv),
      F.tap(processExistAsset(ticker)),
      F.not
    );

    const processFetchFailures = (
      yfInfoEitherArr: Awaited<ReturnType<typeof this.mkAssetSrv.fetchInfoArr>>
    ) => failures.push(...Either.getLeftArray(yfInfoEitherArr));

    const createNewExchanges = (
      fulfilledYfInfoArr: ReturnType<typeof this.mkAssetSrv.fulfillYfInfo>[]
    ) => {
      const newExchangeMap = new Map(
        fulfilledYfInfoArr
        .filter(ele => ele.marketExchange?.getIsRegisteredUpdater() === false)
        .map(ele => [ ele.marketExchange!.ISO_Code, ele.marketExchange! ])
      );

      return Promise.all([...newExchangeMap.values()].map(
        e => this.dbExchangeSrv.createOne({
          ISO_Code: e.ISO_Code,
          ISO_TimezoneName: e.ISO_TimezoneName,
          marketDate: e.getMarketDateYmdStr()
        })
        .then(res => {
          this.updaterSrv.registerExchangeUpdater(res);
          return Either.right<any, typeof res>(res)
        })
        .catch(err => Either.left<any, Awaited<ReturnType<typeof this.dbExchangeSrv.createOne>>>(err))
      ));
    };

    // Todo: return type
    const createFinAssets = async (
      fulfilledYfInfoArr: ReturnType<typeof this.mkAssetSrv.fulfillYfInfo>[],
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
      return this.dbFinAssetSrv.createMany(finAssets).catch(err => err);
      // exchange === undefined 인 경우 추가적인 처리 ?
    };

    const yfInfoArr = await F.pipe(
      tickerArr,
      deduplicate, F.toAsync,
      F.filter(isNotExistAsset),
      F.toArray,
      this.mkAssetSrv.fetchInfoArr.bind(this.mkAssetSrv),
      F.tap(processFetchFailures),
      Either.getRightArray
    );

    const yfInfoCreationRes = await this.dbYfInfoSrv.insertMany(yfInfoArr);
    
    const fulfilledYfInfoArr = yfInfoArr.map(this.mkAssetSrv.fulfillYfInfo.bind(this.mkAssetSrv));
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