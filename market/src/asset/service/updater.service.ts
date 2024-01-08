import { Injectable } from '@nestjs/common';
import { Market_FinancialAssetService } from 'src/market/financialAsset/financialAsset.service';
import { Database_FinancialAssetService } from 'src/database/financialAsset/financialAsset.service';
import { FulfilledYfPrice, ExchangeIsoCode } from 'src/common/interface';
import Either from 'src/common/class/either';

@Injectable()
export class Asset_UpdaterService {

  constructor(
    private readonly market_financialAssetSrv: Market_FinancialAssetService,
    private readonly database_financialAssetSrv: Database_FinancialAssetService,
  ) {}

  public async getUpdateEitherArr(
    isoCode: ExchangeIsoCode
  ): Promise<Either<any, FulfilledYfPrice>[]> {
    const tickerArr = await this.database_financialAssetSrv.readSymbolsByExchange(isoCode);
    return this.market_financialAssetSrv.fetchFulfilledYfPrices(isoCode, tickerArr);
  }

}
