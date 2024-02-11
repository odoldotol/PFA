import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { MarketApiService } from "src/marketApi/marketApi.service";
import { DatabaseService } from "src/database/database.service";
import { MarketDate } from "src/common/class/marketDate.class";
import * as F from '@fxts/core';

@Injectable()
export class UpdaterService
  implements OnModuleInit
{
  private readonly logger = new Logger(UpdaterService.name);

  constructor(
    private readonly marketApiSrv: MarketApiService,
    private readonly dbSrv: DatabaseService
  ) {}

  async onModuleInit() {
    await this.selectiveCacheUpdate();
  }

  public updatePriceByExchange(ISO_Code: string, body: UpdatePriceByExchangeBodyI) {
    return this.dbSrv.updatePriceBySpPSets([
      [ISO_Code, new MarketDate(body.marketDate)],
      body.priceArrs
    ]);
  }

  private async selectiveCacheUpdate() {
    await F.pipe(
      this.spAsyncIter(),
      F.reject(this.isSpLatest.bind(this)),
      F.map(this.withPriceSetArr.bind(this)),
      F.each(this.dbSrv.updatePriceBySpPSets.bind(this.dbSrv))
    ).then(() =>
      this.logger.verbose(`SelectiveUpdate Success`)
    ).catch(e => {
      this.logger.verbose(`SelectiveUpdate Failed`);
      this.logger.error(e);
      throw e
    });
  }

  private spAsyncIter() {
    return F.pipe(
      this.marketApiSrv.fetchAllSpDoc(), F.toAsync,
      F.map(this.spDocToSp)
    );
  }

  private async isSpLatest(sp: Sp) {
    return MarketDate.areEqual(
      F.last(sp),
      await this.dbSrv.readCcStatusPrice(F.head(sp))
    );
  }

  private async withPriceSetArr(sp: Sp) {
    return [
      sp,
      await this.marketApiSrv.fetchPriceByISOcode(F.head(sp))
    ] as [Sp, PSet[]];
  }

  private spDocToSp(spDoc: StatusPrice) {
    return [spDoc.isoCode, MarketDate.fromSpDoc(spDoc)] as Sp;
  }

}
