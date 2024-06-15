// Todo: Entity 의 변경(price -> financialAsset)에 따라 리팩터링

import {
  Injectable,
  // Logger,
} from "@nestjs/common";
import { MarketDate } from "src/common/class/marketDate.class";
import {
  MarketDateService,
  PriceService
} from "src/database";
import { MarketApiService } from "src/marketApi";
import { CachedPrice } from "src/common/class/cachedPrice.class";
import {
  FinancialAssetCore,
  Ticker
} from "src/common/interface";

@Injectable()
export class AssetService {

  // private readonly logger = new Logger(AssetService.name);
  private readonly runningInquirePriceMap = new Map<Ticker, Promise<CachedPrice>>();

  constructor(
    private readonly priceSrv: PriceService,
    private readonly marketDateSrv: MarketDateService,
    private readonly marketApiSrv: MarketApiService
  ) {}

  /**
   * - 배치 프로세싱 + 캐싱
   * @todo 엔티티 리팩터링, inquirePrice -> inquireFinancialAsset
   */
  public async inquirePrice(
    ticker: Ticker,
    _id: string = ""
  ): Promise<{
    data: CachedPrice;
    updated: boolean;
    created: boolean;
  }> {
    let updated = false;
    let created = false;

    const result = (data: CachedPrice) => ({
      data,
      updated,
      created
    });

    // const devLogger = <T>(arg: T): T => {
    //   this.logger.verbose(
    //     `${ticker} : ${updated ? 'updated' : created ? 'created' : 'read'} | ${_id}`
    //   );
    //   return arg;
    // };

    if (this.runningInquirePriceMap.has(ticker)) {
      return result(
        await this.runningInquirePriceMap.get(ticker)!
        // .then(devLogger)
      );
    }

    const inquirePricePromise = this.inquirePriceRaw(
      ticker,
      () => updated = true,
      () => created = true
    ).finally(() => this.runningInquirePriceMap.delete(ticker));

    this.runningInquirePriceMap.set(ticker, inquirePricePromise);

    return result(
      await inquirePricePromise
      // .then(devLogger)
    );
  }

  /**
   * @todo redis 에서 요류가 필요한 실패시 null 반환 말고 에러 던지도록 리팩터링 -> null 체크와 마지막 에러 던지는 부분 리팩(제거)
   * @todo 엔티티 리팩터링, inquirePrice -> inquireFinancialAsset
   */
  private async inquirePriceRaw(
    ticker: Ticker,
    updatedCb: (...args: any) => any,
    createdCb: (...args: any) => any
  ): Promise<CachedPrice> {
    let price = await this.priceSrv.readWithCounting(ticker);
    if (price !== null) { // 있으면
      if (await this.isUptodate(price)) { // 최신이면
        return price;
      } else { // 최신아니면
        const asset = await this.marketApiSrv.fetchFinancialAsset(ticker);
        price = await this.updateFromAsset(asset);
        if (price !== null) {
          updatedCb();
          return price;
        }
      }
    } else { // 없으면
      const asset = await this.marketApiSrv.fetchFinancialAsset(ticker);
      price = await this.createFromAsset(asset);
      if (price !== null) {
        createdCb();
        return price;
      }
    }
    // Todo: redisRepository 에서 각 CRUD 에 대해 요류가 필요한 실패시 null 반환 말고 에러 던지도록 리팩터링 후 제거?
    throw new Error(`Failed to inquire price of ${ticker}`);
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
