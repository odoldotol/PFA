import {
  Injectable,
  Logger,
  OnApplicationBootstrap
} from "@nestjs/common";
import { ExchangeService } from "src/exchange/exchange.service";
import { Asset_UpdaterService } from "src/asset/service";
import { DatabaseService } from "src/database/database.service";
import { ProductApiService } from "src/productApi/productApi.service";
import { Market_Exchange } from "src/market/exchange/class";
import { Log_priceUpdate } from "src/database/log_priceUpdate/log_priceUpdate.schema";
import { FulfilledYfPrice } from "src/common/interface";
import { Launcher } from "src/common/enum";
import Either, * as E from 'src/common/class/either';
import * as F from "@fxts/core";

@Injectable()
export class UpdaterService
  implements OnApplicationBootstrap
{
  private readonly logger = new Logger(UpdaterService.name);

  constructor(
    private readonly exchangeSrv: ExchangeService,
    private readonly assetUpdaterSrv: Asset_UpdaterService,
    private readonly databaseSrv: DatabaseService,
    private readonly productApiSrv: ProductApiService,
  ) {}

  async onApplicationBootstrap() {
    await this.synchronizeAllExchangesWithMarket();
    this.exchangeSrv.registerUpdaterAllExchanges(this.updater.bind(this));
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
    this.logger.log(`${isoCode} : Update Run!!!`);
    const startTime = new Date();
    
    const updateEitherArr = await this.assetUpdaterSrv.getUpdateEitherArr(isoCode);
    const updateResult = await this.databaseSrv.updateRegularMarketClose(
      updateEitherArr,
      exchange,
    ).then(res => (this.logger.log(`${isoCode} : Update End!!!`), res));

    // Todo: Refac (불필요한 부분일 수 있음) ---------------------
    let endTime: Date;
    const newLogDoc: Log_priceUpdate = {
      launcher,
      isStandard: true,
      key: exchange.isoCode,
      success: E.getRightArray(updateResult),
      failure: E.getLeftArray(updateResult),
      startTime: startTime.toISOString(),
      endTime: (endTime = new Date()).toISOString(),
      duration: endTime.getTime() - startTime.getTime()
    };

    this.databaseSrv.createLogPriceUpdate(newLogDoc);
    // ------------------------------------------------------

    this.productApiSrv.updatePriceByExchange(exchange, updateResult);

    return updateResult;
  }

}
