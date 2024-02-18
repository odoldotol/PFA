// Todo: Entity 의 변경에 따라 완전히 리팩터링 될것

import { Injectable, Logger } from "@nestjs/common";
import { MarketDate } from "src/common/class/marketDate.class";
import { MarketDateService } from "src/database/marketDate/marketDate.service";
import { PriceService } from "src/database/price/price.service";
import { MarketApiService } from "src/marketApi/marketApi.service";
import { CachedPrice } from "src/common/class/cachedPrice.class";
import { FinancialAssetCore } from "src/common/interface";

@Injectable()
export class AssetService {

  private readonly logger = new Logger(AssetService.name);

  constructor(
    private readonly priceSrv: PriceService,
    private readonly marketDateSrv: MarketDateService,
    private readonly marketApiSrv: MarketApiService
  ) {}

  // null 반한할꺼면 에러던져야함.
  public async inquirePrice(ticker: string, id: string = "") {

    let data: CachedPrice | null;
    let updated: boolean = false;
    let created: boolean = false;

    const price = await this.priceSrv.readWithCounting(ticker);

    if (price !== null) { // 있으면

      if (await this.isUptodate(price)) { // 최신이면
        data = price;
      } else { // 최신아니면
        const asset = await this.marketApiSrv.fetchFinancialAsset(ticker);
        data = await this.updateFromAsset(asset);
        updated = true;
      }

    } else { // 없으면
      const asset = await this.marketApiSrv.fetchFinancialAsset(ticker);
      data = await this.createFromAsset(asset);
      created = true;
    }
    
    this.logger.verbose(
      `${ticker} : ${updated ? 'updated' : created ? 'created' : 'read'} | ${id}`
    );

    return {
      data,
      updated,
      created
    };
  }

  private async isUptodate(cachedPrice: CachedPrice) {
    return MarketDate.areEqual(
      cachedPrice.marketDate,
      await this.marketDateSrv.read(cachedPrice.ISO_Code)
    );
  }

  private async updateFromAsset(asset: FinancialAssetCore) {
    return this.priceSrv.update(
      asset.symbol,
      {
        price: asset.regularMarketLastClose,
        marketDate: (await this.marketDateSrv.read(asset.exchange!))!
      }
    );
  }

  private async createFromAsset(asset: FinancialAssetCore) {
    return this.priceSrv.create(
      asset.symbol,
      {
        price: asset.regularMarketLastClose,
        ISO_Code: asset.exchange!,
        currency: asset.currency,
        marketDate: (await this.marketDateSrv.read(asset.exchange!))!,
        count: 1
      } as CachedPrice
    );
  }

}
