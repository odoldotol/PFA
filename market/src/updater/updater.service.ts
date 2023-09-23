import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ProductApiService } from 'src/product_api/product_api.service';
import { ExchangeService as MkExchangeService } from 'src/market/exchange/exchange.service';
import { ExchangeService as DbExchangeService } from 'src/database/exchange/exchange.service';
import { FinancialAssetService as DbFinancialAssetService } from 'src/database/financialAsset/financialAsset.service';
import { AssetService as MkAssetService } from 'src/market/asset/asset.service';
import { UpdaterService as DbUpdaterService } from 'src/database/updater.service';
import { Exchange } from 'src/market/exchange/class/exchange';
import { TExchangeCore, TUpdateTuple } from 'src/common/type';
import { Launcher } from 'src/common/enum';
import * as F from "@fxts/core";

@Injectable()
export class UpdaterService implements OnModuleInit {

  private readonly logger = new Logger(UpdaterService.name);

  constructor(
    private readonly mkExchangeSrv: MkExchangeService,
    private readonly mkAssetSrv: MkAssetService,
    private readonly dbExchangeSrv: DbExchangeService,
    private readonly dbFinAssetSrv: DbFinancialAssetService,
    private readonly dbUpdaterSrv: DbUpdaterService,
    private readonly productApiSrv: ProductApiService,
  ) {}

  async onModuleInit() {
    await this.initiateExchangesUpdater();
  }

  public async initiateExchangesUpdater() {
    const updateNow = (exchange: TExchangeCore) => this.mkExchangeSrv.fulfillUpdater(
      this.updateAssetsOfExchange.bind(this),
      exchange
    )(Launcher.INITIATOR);

    await F.pipe(
      this.dbExchangeSrv.readAll(), F.toAsync,
      F.peek(this.registerExchangeUpdater.bind(this)),
      F.filter(this.mkExchangeSrv.shouldUpdate.bind(this.mkExchangeSrv)),
      F.each(updateNow)
    );
  }

  public registerExchangeUpdater(exchangeLike: TExchangeCore | Exchange) {
    this.mkExchangeSrv.registerUpdater(
      this.updateAssetsOfExchange.bind(this),
      exchangeLike
    );
  }

  public async updateAssetsOfExchange(exchange: Exchange, launcher: Launcher) {
    const { ISO_Code } = exchange;
    this.logger.log(`${ISO_Code} : Updater Run!!!`);
    const startTime = new Date();
    
    let updateResult
    try {
      const symbolArr = await this.dbFinAssetSrv.readSymbolsByExchange(ISO_Code);
      const updateArr = await this.mkAssetSrv.fetchFulfilledPriceArr(exchange, symbolArr);
      
      updateResult = await this.dbUpdaterSrv.updatePriceStandard(
        updateArr,
        exchange,
        startTime,
        launcher
      ).then(res => (this.logger.log(`${ISO_Code} : Updater End!!!`), res));
    } catch (error) {
      this.logger.error(error);
      this.logger.log(`${ISO_Code} : Updater Failed!!!`);
      return;
    }
    
    const marketDate = exchange.getMarketDateYmdStr();
    const priceArrs: TUpdateTuple[] = F.pipe(
      updateResult,
      F.filter(ele => ele.isRight()),
      F.map(ele => ele.getRight),
      F.toArray
    );
    this.productApiSrv.updatePriceByExchange(ISO_Code, { marketDate, priceArrs });
  }

}
