import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ProductApiService } from 'src/product_api/product_api.service';
import { Market_ExchangeService } from 'src/market/exchange/exchange.service';
import { Database_ExchangeService } from 'src/database/exchange/exchange.service';
import { Database_FinancialAssetService } from 'src/database/financialAsset/financialAsset.service';
import { MarketService } from 'src/market/market.service';
import { UpdaterService as DbUpdaterService } from 'src/database/updater.service';
import { Exchange } from 'src/market/exchange/class/exchange';
import { TExchangeCore, TUpdateTuple } from 'src/common/type';
import { Launcher } from 'src/common/enum';
import * as F from "@fxts/core";

// Todo: NewExchange 리팩터링 후에 여기도 리팩터링하기 
@Injectable()
export class UpdaterService implements OnModuleInit {

  private readonly logger = new Logger(UpdaterService.name);

  constructor(
    private readonly market_exchangeSrv: Market_ExchangeService,
    private readonly marketSrv: MarketService,
    private readonly database_exchangeSrv: Database_ExchangeService,
    private readonly database_financialAssetSrv: Database_FinancialAssetService,
    private readonly dbUpdaterSrv: DbUpdaterService,
    private readonly productApiSrv: ProductApiService,
  ) {}

  async onModuleInit() {
    await this.initiateExchangesUpdater();
  }

  public async initiateExchangesUpdater() {
    const updateNow = (exchange: TExchangeCore) => this.market_exchangeSrv.fulfillUpdater(
      this.updateAssetsOfExchange.bind(this),
      exchange
    )(Launcher.INITIATOR);

    await F.pipe(
      this.database_exchangeSrv.readAll(), F.toAsync,
      F.peek(this.registerExchangeUpdater.bind(this)),
      F.filter(this.market_exchangeSrv.shouldUpdate.bind(this.market_exchangeSrv)),
      F.each(updateNow)
    );
  }

  public registerExchangeUpdater(exchangeLike: TExchangeCore | Exchange) {
    this.market_exchangeSrv.registerUpdater(
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
      const symbolArr = await this.database_financialAssetSrv.readSymbolsByExchange(ISO_Code);
      const updateArr = await this.marketSrv.fetchFulfilledYfPrices(exchange, symbolArr);
      
      updateResult = await this.dbUpdaterSrv.updatePriceStandard(
        updateArr,
        exchange,
        startTime,
        launcher
      ).then(res => (this.logger.log(`${ISO_Code} : Updater End!!!`), res));
    } catch (error) {
      // Todo: warn
      this.logger.warn(`${ISO_Code} : Updater Failed!!!\nError: ${error}`);
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
