import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ProductApiService } from 'src/productApi/productApi.service';
import { Market_ExchangeService } from 'src/market/exchange/exchange.service';
import { Database_ExchangeService } from 'src/database/exchange/exchange.service';
import { Database_FinancialAssetService } from 'src/database/financialAsset/financialAsset.service';
import { MarketService } from 'src/market/market.service';
import { DatabaseService } from 'src/database/database.service';
import { Market_Exchange } from 'src/market/exchange/class/exchange';
import { Exchange } from 'src/database/exchange/exchange.entity';
import { Log_priceUpdate } from 'src/database/log_priceUpdate/log_priceUpdate.schema';
import { FulfilledYfPrice } from 'src/common/interface';
import { Launcher, MarketEvent } from 'src/common/enum';
import Either, * as E from 'src/common/class/either';
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
      ? this.logger.warn(`${exchange.isoCode} : Already registered updater`) //
      : this.registerUpdater(exchange)
    );
  }

  private registerUpdater(exchange: Market_Exchange): void {
    exchange.on(
      MarketEvent.UPDATE,
      this.listenerOfUpdateEvent.bind(this, exchange)
    );
    exchange.setUpdaterRegisteredTrue();
    this.logger.verbose(`${exchange.isoCode} : Updater Registered`);
  }

  private async createNewExchanges(): Promise<void> {
    await F.pipe(
      this.market_exchangeSrv.getAll(), F.toAsync,
      F.filter(this.isNewExchange.bind(this)),
      F.peek(this.createExchange.bind(this)),
      F.each(this.logNewExchange.bind(this))
    );
  }

  private async updateAssetsOutofdateExchanges(): Promise<void> {
    await F.pipe(
      this.database_exchangeSrv.readAll(),
      F.filter(this.isOutofdateExchange.bind(this)),
      F.map(this.market_exchangeSrv.getOne.bind(this.market_exchangeSrv)), F.toAsync,
      F.map(this.update.bind(this, Launcher.INITIATOR)),
      F.toArray
    );
  }

  private listenerOfUpdateEvent(exchange: Market_Exchange) {
    this.update(Launcher.SCHEDULER, exchange)
    .catch(e => exchange.emit("error", e));
  }

  private async isNewExchange(exchange: Market_Exchange): Promise<boolean> {
    return F.not((await this.database_exchangeSrv.exist({ isoCode: exchange.isoCode })));
  }

  private createExchange(exchange: Market_Exchange): Promise<Exchange> {
    return this.database_exchangeSrv.createOne({
      isoCode: exchange.isoCode,
      isoTimezoneName: exchange.isoTimezoneName,
      marketDate: exchange.marketDate
    });
  }

  private logNewExchange(exchange: Market_Exchange): void {
    this.logger.verbose(`New Exchange Created: ${exchange.isoCode}`);
  }

  private isOutofdateExchange(exchange: Exchange): boolean {
    const marketExchange = this.market_exchangeSrv.getOne(exchange.isoCode);
    const result = exchange.marketDate != marketExchange.marketDate;
    
    // Todo: Warn 처리
    result &&
    marketExchange.isMarketOpen() &&
    this.logger.warn(`${exchange.isoCode} : Run Updater while Open`);

    return result;
  }

  private async update(
    launcher: Launcher,
    exchange: Market_Exchange
  ): Promise<Either<any, FulfilledYfPrice>[]> {
    const { isoCode } = exchange;
    this.logger.log(`${isoCode} : Update Run!!!`);
    const startTime = new Date();
    
    const updateEitherArr = await this.marketSrv.fetchFulfilledYfPrices(
      exchange,
      await this.database_financialAssetSrv.readSymbolsByExchange(isoCode)
    );
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
