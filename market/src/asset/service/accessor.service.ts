import {
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from "@nestjs/common";
import { GetPriceByTickerResponse } from "../response/getPriceByTicker.response";
import {
  Database_FinancialAssetService
} from "src/database/financialAsset/financialAsset.service";
import { AdderService } from "./adder.service";
import { ExchangeIsoCode, Ticker } from "src/common/interface";
import Either from "src/common/class/either";

@Injectable()
export class AccessorService {

  constructor(
    private readonly database_financialAssetSrv: Database_FinancialAssetService,
    private readonly adderSrv: AdderService,
  ) {}

  // Todo: 에러 핸들링
  public async getPriceByTicker(
    ticker: Ticker
  ): Promise<GetPriceByTickerResponse> {
    const asset = await this.database_financialAssetSrv.readOneByPk(ticker);
    if (asset) return new GetPriceByTickerResponse(asset);
    else {
      const addAssetsRes
      = await this.adderSrv.addAssetsFromFilteredTickers([Either.right(ticker)]);
      if (addAssetsRes.assets[0] === undefined) {
        if (addAssetsRes.failure.general[0]?.doc === "Mapping key not found.")
          throw new NotFoundException(
            `Could not find Ticker: ${addAssetsRes.failure.general[0].ticker}`
          );
        else throw new InternalServerErrorException(addAssetsRes);
      }
      return new GetPriceByTickerResponse(addAssetsRes.assets[0]);
    }
  }

  // Todo: Refac - Response Type, API npm
  public getPriceByExchange(isoCode: ExchangeIsoCode) {
    return this.database_financialAssetSrv.readManyByExchange(isoCode)
    .then(res => res.map(ele => [
      ele.symbol,
      ele.regularMarketLastClose,
      ele.quoteType === "INDEX" ? "INDEX" : ele.currency
    ]));
  }

}
