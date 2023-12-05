import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { GetPriceByTickerResponse } from "../response/getPriceByTicker.response";
import { Database_FinancialAssetService } from "src/database/financialAsset/financialAsset.service";
import { AdderService } from "./adder.service";

@Injectable()
export class AccessorService {

  constructor(
    private readonly database_financialAssetSrv: Database_FinancialAssetService,
    private readonly adderSrv: AdderService,
  ) {}

  // Todo: 에러 핸들링
  public async getPriceByTicker(ticker: string): Promise<GetPriceByTickerResponse> {
    const asset = await this.database_financialAssetSrv.readOneByPk(ticker);
    if (asset) return new GetPriceByTickerResponse(asset);
    else {
      const addAssetsRes = await this.adderSrv.addAssets([ticker]);
      if (addAssetsRes.assets[0] === undefined) {
        if (addAssetsRes.failure.general[0]?.doc === "Mapping key not found.")
          throw new NotFoundException(`Could not find Ticker: ${addAssetsRes.failure.general[0].ticker}`);
        else throw new InternalServerErrorException(addAssetsRes);
      }
      return new GetPriceByTickerResponse(addAssetsRes.assets[0]);
    }
  }

  // Todo: Refac - Response Type
  public getPriceByExchange(ISO_Code: string) {
    return this.database_financialAssetSrv.readManyByExchange(ISO_Code)
    .then(res => res.map(ele => [
      ele.symbol,
      ele.regularMarketLastClose,
      ele.quoteType === "INDEX" ? "INDEX" : ele.currency
    ]));
  }

}
