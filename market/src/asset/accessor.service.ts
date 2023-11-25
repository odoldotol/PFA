import { Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common";
import { ResponseGetPriceByTicker } from "./response/getPriceByTicker.response";
import { Database_FinancialAssetService } from "src/database/financialAsset/financialAsset.service";
import { AdderService } from "./adder.service";
import * as F from "@fxts/core";

@Injectable()
export class AccessorService {

  private readonly logger = new Logger(AccessorService.name);

  constructor(
    private readonly database_financialAssetSrv: Database_FinancialAssetService,
    private readonly adderSrv: AdderService,
  ) {}

  // Todo: 에러 핸들링
  public async getPriceByTicker(ticker: string): Promise<ResponseGetPriceByTicker> {
    const asset = await this.database_financialAssetSrv.readOneByPk(ticker);
    if (asset) return new ResponseGetPriceByTicker(asset);
    else {
      const addAssetsRes = await this.adderSrv.addAssets([ticker]);
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

}
