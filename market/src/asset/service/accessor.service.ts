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

  public async getPriceByExchange(
    isoCode: ExchangeIsoCode
  ): Promise<GetPriceByExchangeResponse> {
    return new GetPriceByExchangeResponse(
      await this.database_financialAssetSrv.readManyByExchange(isoCode)
    );
  }

  public async fetchFulfilledYfPricesOfSubscribedAssets(
    isoCode: ExchangeIsoCode
  ): Promise<Either<any, FulfilledYfPrice>[]> {
    const tickerArr = await this.database_financialAssetSrv.readSymbolsByExchange(isoCode);
    return this.market_financialAssetSrv.fetchFulfilledYfPriceArr(isoCode, tickerArr);
  }

}
