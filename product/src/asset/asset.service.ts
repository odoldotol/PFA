import { Injectable, Logger } from "@nestjs/common";
import { MarketDate } from "src/common/class/marketDate.class";
import { MarketDateService } from "src/database/marketDate/marketDate.service";
import { PriceService } from "src/database/price/price.service";
import { MarketApiService } from "src/marketApi/marketApi.service";
import * as F from '@fxts/core';

@Injectable()
export class AssetService {

  private readonly logger = new Logger(AssetService.name);

  constructor(
    private readonly priceSrv: PriceService,
    private readonly marketDateSrv: MarketDateService,
    private readonly marketApiSrv: MarketApiService
  ) {}

  // temp
  public fetchFinancialAsset(ticker: string) {
    return this.marketApiSrv.fetchFinancialAsset(ticker);
  }

  // null 반한할꺼면 에러던져야함.
  public async inquirePrice(ticker: string, id: string = "") {

    let data: CachedPriceI | null;
    let updated: boolean = false;
    let created: boolean = false;

    const price = await this.priceSrv.read_with_counting(ticker);

    if (price !== null) { // 있으면
      // 최신 검사
      // this.dbSrv.readCcStatusPrice
      const isUptodate = MarketDate.areEqual(
        price.marketDate,
        await this.marketDateSrv.read(price.ISO_Code)
      );

      if (isUptodate) {
        data = price;
        this.logger.verbose(`${ticker} : read | ${id}`);
      } else { // 최신아니면
        const rp = await this.marketApiSrv.fetchPriceByTicker(ticker);
        // this.dbSrv.readCcStatusPrice
        const cachedPrice = F.pick(
          ["price", "marketDate"],
          Object.assign(rp, { marketDate: await this.marketDateSrv.read(rp.ISO_Code) })
        ) as CachedPriceI;
        // this.dbSrv.updateCcPrice
        data = await this.priceSrv.update([ticker, cachedPrice]);
        updated = true;
        this.logger.verbose(`${ticker} : updated | ${id}`);
      }
    } else { // 없으면
      const rp = await this.marketApiSrv.fetchPriceByTicker(ticker);
      // this.dbSrv.createCcPriceStatusWithRP
      await (() => rp.newExchange &&
      this.marketDateSrv.create([
        rp.newExchange.isoCode,
        MarketDate.fromSpDoc(rp.newExchange)
      ]))();
      // this.dbSrv.readCcStatusPrice
      const cachedPrice = Object.assign(rp, {
        marketDate: await this.marketDateSrv.read(rp.ISO_Code),
        count: 1
      }) as CachedPriceI;
      // dbSrv.createCcPrice
      data = await this.priceSrv.create([ticker, cachedPrice]);
      created = true;
      this.logger.verbose(`${ticker} : created | ${id}`);
    }

    return {
      data,
      updated,
      created
    };
  }

}
