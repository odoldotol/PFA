import { Injectable, Logger } from "@nestjs/common";
import { Database_ExchangeService } from "src/database";
import { Market_ExchangeService } from "src/market";
import { Market_Exchange } from "src/market/exchange/class";
import { ExchangeCore, UpdateEventListener } from "src/common/interface";
import { MarketEvent } from "src/common/enum";
import * as F from "@fxts/core";

@Injectable()
export class ExchangeService {

  private readonly logger = new Logger(ExchangeService.name);

  constructor(
    private readonly database_exchangeSrv: Database_ExchangeService,
    private readonly market_exchangeSrv: Market_ExchangeService,
  ) {}

  public getAllExchanges() {
    return this.database_exchangeSrv.readAll();
  }

  public registerUpdaterAllExchanges(
    updater: UpdateEventListener
  ): void {
    this.market_exchangeSrv.getAll()
    .forEach(exchange => exchange.isUpdaterRegistered()
      ? this.logger.warn(`${exchange.isoCode} : Already registered updater`) //
      : this.registerUpdater(exchange, updater)
    );
  }

  public async createNewExchanges(): Promise<void> {
    await F.pipe(
      this.market_exchangeSrv.getAll(), F.toAsync,
      F.filter(this.isNewExchange.bind(this)),
      F.peek(this.createExchange.bind(this)),
      F.each(this.logNewExchange.bind(this))
    );
  }

  public getOutofdateExchanges(): Promise<Market_Exchange[]> {
    return F.pipe(
      this.database_exchangeSrv.readAll(),
      F.filter(this.isOutofdateExchange.bind(this)),
      F.map(this.market_exchangeSrv.getOne.bind(this.market_exchangeSrv)),
      F.toArray
    );
  }

  private registerUpdater(
    exchange: Market_Exchange,
    listenerOfUpdateEvent: UpdateEventListener
  ): void {
    exchange.on(
      MarketEvent.UPDATE,
      listenerOfUpdateEvent
    );
    exchange.setUpdaterRegisteredTrue();
    this.logger.verbose(`${exchange.isoCode} : Updater Registered`);
  }

  private async isNewExchange(exchange: Market_Exchange): Promise<boolean> {
    return F.not((await this.database_exchangeSrv.exist({ iso_code: exchange.isoCode })));
  }

  private createExchange(exchange: Market_Exchange): Promise<ExchangeCore> {
    return this.database_exchangeSrv.createOne(exchange);
  }

  private logNewExchange(exchange: Market_Exchange): void {
    this.logger.verbose(`New Exchange Created: ${exchange.isoCode}`);
  }

  private isOutofdateExchange(exchange: ExchangeCore): boolean {
    const marketExchange = this.market_exchangeSrv.getOne(exchange.isoCode);
    return exchange.marketDate != marketExchange.marketDate;
  }
}
