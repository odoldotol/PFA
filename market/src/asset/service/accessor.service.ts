import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from "@nestjs/common";
import { GetPriceByExchangeResponse } from "../response";
import { Market_FinancialAssetService } from "src/market";
import { Database_FinancialAssetService } from "src/database";
import { SubscriberService } from "./subscriber.service";
import {
  ExchangeIsoCode,
  FinancialAssetCore,
  FulfilledYfPrice,
  Ticker
} from "src/common/interface";
import Either from "src/common/class/either";

@Injectable()
export class AccessorService {

  constructor(
    private readonly market_financialAssetSrv: Market_FinancialAssetService,
    private readonly database_financialAssetSrv: Database_FinancialAssetService,
    private readonly subscriberSrv: SubscriberService,
  ) {}

  /**
   * @todo 지원하지 않는 거래소는 정기 업데이트 없기때문에, 이에 대한 요청에서 필요시 marketchildapi 이용할 수 있는게 좋을것같음. 결국 정기업데이트 말고도 개별 업데이트가 가능해야함. 언제 개별업데이트를 할 것인가 가 문제. 방법 없으면 업데이트 하지않고 매번 차일드를 통해야함.
   */
  public getFinancialAsset(
    ticker: Ticker
  ): Promise<FinancialAssetCore | null> {
    return this.database_financialAssetSrv.readOneByPk(ticker);
  }

  /**
   * @todo refac Error handling
   */
  public async subscribeAssetAndGet(
    ticker: Ticker
  ): Promise<FinancialAssetCore> {
    const subscribeAssetsRes
    = await this.subscriberSrv.subscribeAssetsFromFilteredTickers([
      Either.right(ticker)
    ]);
    if (subscribeAssetsRes.assets[0] === undefined) {
      const failure = subscribeAssetsRes.failure.general[0];
      if (failure.statusCode === HttpStatus.NOT_FOUND) {
        throw new NotFoundException(
          failure,
          `Could not find Ticker: ${failure.ticker}`
        );
      } else {
        throw new InternalServerErrorException(subscribeAssetsRes);
      }
    } else {
      return subscribeAssetsRes.assets[0];
    }
  }

  /**
   * @todo 쿼리에서부터 가격만 가져올까?
   */
  public async getPriceByExchange(
    isoCode: ExchangeIsoCode
  ): Promise<GetPriceByExchangeResponse> {
    return new GetPriceByExchangeResponse(
      await this.database_financialAssetSrv.readUptodateManyByExchange(isoCode)
    );
  }

  public async fetchFulfilledYfPricesOfSubscribedAssets(
    isoCode: ExchangeIsoCode
  ): Promise<Either<any, FulfilledYfPrice>[]> {
    const tickerArr = await this.database_financialAssetSrv.readSymbolsByExchange(isoCode);
    if (0 < tickerArr.length) {
      return this.market_financialAssetSrv.fetchFulfilledYfPriceByTickerArr(isoCode, tickerArr);
    } else {
      return [];
    }
  }
}
