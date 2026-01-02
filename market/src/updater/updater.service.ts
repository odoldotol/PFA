import {
  Injectable,
  OnApplicationBootstrap
} from "@nestjs/common";
import { AppConfigService } from "src/config";
import { ExchangeService } from "src/exchange";
import { AccessorService } from "src/asset";
import { Database_UpdaterService } from "src/database";
import { ProductApiService } from "src/productApi";
import { Market_Exchange } from "src/market";
import { Log_priceUpdate } from "src/database/log_priceUpdate/log_priceUpdate.schema";
import { FulfilledYfPrice } from "src/common/interface";
import { Launcher } from "src/common/enum";
import { Loggable } from "src/logger";
import Either, * as E from '@odoldotol/either';
import * as F from "@fxts/core";

@Injectable()
export class UpdaterService
  extends Loggable
  implements OnApplicationBootstrap
{
  constructor(
    private readonly appConfigSrv: AppConfigService,
    private readonly exchangeSrv: ExchangeService,
    private readonly accessorSrv: AccessorService,
    private readonly database_updaterSrv: Database_UpdaterService,
    private readonly productApiSrv: ProductApiService,
  ) {
    super();
  }

  async onApplicationBootstrap() {
    try {
      await this.synchronizeAllExchangesWithMarket();
      this.exchangeSrv.registerUpdaterAllExchanges(this.updater.bind(this));
    } catch (e: any) {
      console.error(e, e.stack);
      process.exit(1);
    }
  }

  private async synchronizeAllExchangesWithMarket(): Promise<void> {
    await this.exchangeSrv.createNewExchanges();
    await this.updateAssetsOutofdateExchanges();
  }

  private updater(exchange: Market_Exchange): void {
    this.update(Launcher.SCHEDULER, exchange)
    .catch(e => exchange.emit("error", e));
  }

  private async updateAssetsOutofdateExchanges(): Promise<void> {
    await F.pipe(
      this.exchangeSrv.getOutofdateExchanges(), F.toAsync,
      F.map(this.update.bind(this, Launcher.INITIATOR)),
      F.toArray
    );
  }

  private async update(
    launcher: Launcher,
    exchange: Market_Exchange
  ): Promise<Either<any, FulfilledYfPrice>[]> {
    const { isoCode } = exchange;

    if (this.appConfigSrv.isMarketUpdateDisabled()) {
      this.logger.log(`${isoCode} : Update disabled`);
      return [];
    }

    this.logger.log(`${isoCode} : Update Run`);
    const startTime = new Date();
    
    const updateEitherArr
    = await this.accessorSrv.fetchFulfilledYfPricesOfSubscribedAssets(isoCode);

    return this.database_updaterSrv.update(
      updateEitherArr,
      exchange,
    ).then(res => {
      this.logger.log(`${isoCode} : Update End`);

      const success = E.flatRightFilter(res);

      // Todo: Refac ------------------------------------------
      if (0 < res.length) {
        let endTime: Date;
        const newLogDoc: Log_priceUpdate = {
          launcher,
          isStandard: true,
          key: exchange.isoCode,
          success,
          failure: E.flatLeftFilter(res),
          startTime: startTime.toISOString(),
          endTime: (endTime = new Date()).toISOString(),
          duration: endTime.getTime() - startTime.getTime()
        };
  
        this.database_updaterSrv.createLog(newLogDoc);
      }
      // ------------------------------------------------------

      this.productApiSrv.renewFinancialAssetExchange(exchange, success);

      return res
    });
  }

}
