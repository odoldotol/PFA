import {
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from "@nestjs/common";
import { GetPriceByExchangeResponse } from "../response";
import {
  Database_FinancialAssetService
} from "src/database/financialAsset/financialAsset.service";
import { AdderService } from "./adder.service";
import { FinancialAsset } from "src/database/financialAsset/financialAsset.entity";
import { ExchangeIsoCode, Ticker } from "src/common/interface";
import Either from "src/common/class/either";

@Injectable()
export class AccessorService {

  constructor(
    private readonly database_financialAssetSrv: Database_FinancialAssetService,
    private readonly adderSrv: AdderService,
  ) {}

  public getPrice(
    ticker: Ticker
  ): Promise<FinancialAsset | null> {
    return this.database_financialAssetSrv.readOneByPk(ticker);
  }

  public async addAssetAndGetPrice(
    ticker: Ticker
  ): Promise<FinancialAsset> {
    const addAssetsRes = await this.adderSrv.addAssetsFromFilteredTickers([
      Either.right(ticker)
    ]);
    if (addAssetsRes.assets[0] === undefined) {
      if (addAssetsRes.failure.general[0]?.doc === "Mapping key not found.") {
        throw new NotFoundException(
          `Could not find Ticker: ${addAssetsRes.failure.general[0].ticker}`
        );
      } else {
        throw new InternalServerErrorException(addAssetsRes);
      }
    } else {
      return addAssetsRes.assets[0];
    }
  }

  public async getPriceByExchange(
    isoCode: ExchangeIsoCode
  ): Promise<GetPriceByExchangeResponse> {
    return new GetPriceByExchangeResponse(
      await this.database_financialAssetSrv.readManyByExchange(isoCode)
    );
  }

}
