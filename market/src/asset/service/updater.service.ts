import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ProductApiService } from 'src/product_api/product_api.service';
import { Market_ExchangeService } from 'src/market/exchange/exchange.service';
import { Database_ExchangeService } from 'src/database/exchange/exchange.service';
import { Database_FinancialAssetService } from 'src/database/financialAsset/financialAsset.service';
import { MarketService } from 'src/market/market.service';
import { DatabaseService } from 'src/database/database.service';
import { Market_Exchange } from 'src/market/exchange/class/exchange';
import { TUpdateTuple } from 'src/common/type';
import { Launcher } from 'src/common/enum';
import { EMarketEvent } from 'src/market/exchange/enum/eventName.enum';
import { Exchange } from 'src/database/exchange/exchange.entity';
import { Either } from 'src/common/class/either';
import * as F from "@fxts/core";

@Injectable()
export class UpdaterService implements OnApplicationBootstrap {

  private readonly logger = new Logger(UpdaterService.name);

  constructor(
    private readonly market_exchangeSrv: Market_ExchangeService,
    private readonly marketSrv: MarketService,
    private readonly database_exchangeSrv: Database_ExchangeService,
    private readonly database_financialAssetSrv: Database_FinancialAssetService,
    private readonly databaseSrv: DatabaseService,
    private readonly productApiSrv: ProductApiService,
  ) {}

  async onApplicationBootstrap() {
    await this.synchronizeAllExchangesWithMarket();
    this.registerUpdaterAllExchanges();
  }

  private async synchronizeAllExchangesWithMarket(): Promise<void> {
    await this.createNewExchanges();
    await this.updateAssetsOutofdateExchanges();
  }

  private registerUpdaterAllExchanges(): void {
    this.market_exchangeSrv.getAll()
    .forEach(exchange => exchange.isUpdaterRegistered()
      ? this.logger.warn(`${exchange.ISO_Code} : Already registered updater`) //
      : this.registerUpdater(exchange)
    );
  }

  private registerUpdater(exchange: Market_Exchange): void {
    exchange.on(
      EMarketEvent.UPDATE,
      this.updateAssetsOfExchange.bind(this, Launcher.SCHEDULER, exchange)
    );
    exchange.setUpdaterRegisteredTrue();
    this.logger.verbose(`${exchange.ISO_Code} : Updater Registered`);
  }

  private async createNewExchanges(): Promise<void> {
    await F.pipe(
      this.market_exchangeSrv.getAll(),
      F.toAsync,
      F.filter(this.isNewExchange.bind(this)),
      F.peek(this.createExchange.bind(this)),
      F.each(this.logNewExchange.bind(this))
    );
  }

  private async updateAssetsOutofdateExchanges(): Promise<void> {
    await F.pipe(
      this.database_exchangeSrv.readAll(),
      F.filter(this.isOutofdateExchange.bind(this)),
      F.map(exchange => this.market_exchangeSrv.getOne(exchange)!), // 필터링 하면서 동시에 변경까지 가능한 mapFilter 있으면 좋겠다.
      F.peek(this.warnUpdateWhileMarketOpen.bind(this)),
      F.toAsync,
      F.map(this.updateAssetsOfExchange.bind(this, Launcher.INITIATOR)),
      F.toArray
    );
  }

  private async isNewExchange(exchange: Market_Exchange): Promise<boolean> {
    return F.not((await this.database_exchangeSrv.exist({ ISO_Code: exchange.ISO_Code })));
  }

  private createExchange(exchange: Market_Exchange): Promise<Exchange> {
    return this.database_exchangeSrv.createOne({
      ISO_Code: exchange.ISO_Code,
      ISO_TimezoneName: exchange.ISO_TimezoneName,
      marketDate: exchange.marketDate
    });
  }

  private logNewExchange(exchange: Market_Exchange): void {
    this.logger.verbose(`New Exchange Created: ${exchange.ISO_Code}`);
  }

  private isOutofdateExchange(exchange: Exchange): boolean {
    return exchange.marketDate != this.market_exchangeSrv.getOne(exchange.ISO_Code)!.marketDate;
  }

  private warnUpdateWhileMarketOpen(exchange: Market_Exchange) {
    exchange.isMarketOpen() && this.logger.warn(`${exchange.ISO_Code} : Run Updater while Open`);
  }

  // Todo: return type
  private async updateAssetsOfExchange(launcher: Launcher, exchange: Market_Exchange): Promise<void> {
    const { ISO_Code } = exchange;
    this.logger.log(`${ISO_Code} : Updater Run!!!`);
    const startTime = new Date();
    
    let updateResult: Either<any, TUpdateTuple>[];
    try {
      const symbolArr = await this.database_financialAssetSrv.readSymbolsByExchange(ISO_Code);
      const updateArr = await this.marketSrv.fetchFulfilledYfPrices(exchange, symbolArr);
      
      updateResult = await this.databaseSrv.updatePriceStandard(
        updateArr,
        exchange,
        startTime,
        launcher
      ).then(res => (this.logger.log(`${ISO_Code} : Updater End!!!`), res));
    } catch (error) {
      // Todo: error
      this.logger.error(`${ISO_Code} : Updater Failed!!!\nError: ${error}`);
      return;
    }

    const priceArrs = Either.getRightArray(updateResult);
    this.productApiSrv.updatePriceByExchange(ISO_Code, { marketDate: exchange.marketDate, priceArrs });
  }

}
