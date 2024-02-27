import { Logger, OnApplicationBootstrap } from "@nestjs/common";
import { EventEmitter } from "stream";
import { Market_ExchangeConfig } from "./exchangeConfig";
import { Market_ExchangeSession } from "./exchangeSession";
import {
  ExchangeCore,
  ExchangeIsoCode,
  IsoTimezoneName,
  MarketDate
} from "src/common/interface";
import {
  CloseEventArg,
  OpenEventArg
} from "src/common/interface";
import { MarketEvent } from "src/common/enum";
import { buildLoggerContext } from "src/common/util";
import {
  getLogStyleStr,
  getISOYmdStr
} from "src/common/util/date";
import * as F from '@fxts/core';

export class Market_Exchange
  extends EventEmitter
  implements OnApplicationBootstrap, ExchangeCore
{
  private readonly logger = new Logger(
    buildLoggerContext(Market_Exchange, this.isoCode)
  );

  /**
   * ### Child 서버에 Session 이 반영되기까지의 시간 마진
   * @todo env?
   */
  private readonly sessionEventMarginMs = 60000;
  private readonly sessionEventMarginTickMs = 500;

  private marketDateYmdStr!: MarketDate;
  private marketOpen!: boolean;

  // Todo: 여전히 필요한가?
  private updaterRegistered = false;

  constructor(
    private readonly config: Market_ExchangeConfig,
    private readonly session: Market_ExchangeSession
  ) {
    super();
    // Todo: error 핸들링
    this.on("error", e => this.logger.error(e.stack));
  }

  onApplicationBootstrap() {
    this.subscribe();
    this.calculateMarketDate();
  }

  public get isoCode(): ExchangeIsoCode {
    return this.config.isoCode;
  }

  public get isoTimezoneName(): IsoTimezoneName {
    return this.config.isoTimezoneName;
  }

  public get marketDate(): MarketDate {
    return this.marketDateYmdStr;
  }

  public isMarketOpen(): boolean {
    return this.marketOpen;
  }

  // Todo: 여전히 필요한가?
  public setUpdaterRegisteredTrue() {
    this.updaterRegistered = true;
  }

  // Todo: 여전히 필요한가?
  public isUpdaterRegistered() {
    return this.updaterRegistered;
  }

  private subscribe() {
    if (this.calculateMarketOpen()) {
      this.subscribeNextEventWhenMarketOpen();
    } else {
      this.subscribeNextEventWhenMarketClose();
      this.subscribeNextUpdateIfInMarginGap();
    }
  }

  private subscribeNextEventWhenMarketOpen(): OpenEventArg {
    return {
      nextCloseDate: this.subscribeNextClose(),
      nextUpdateDate: this.subscribeNextUpdate()
    };
  }
  
  private subscribeNextEventWhenMarketClose(): CloseEventArg {
    return { nextOpenDate: this.subscribeNextOpen() };
  }

  private subscribeNextUpdateIfInMarginGap() {
    const previousCloseAddYfUpdateMargin
    = this.addYfUpdateMargin(this.session.previousClose);

    new Date() < previousCloseAddYfUpdateMargin &&
    this.subscribeNextUpdate(previousCloseAddYfUpdateMargin);
  }

  private subscribeNextOpen(): Date {
    const nextOpenDate = this.session.nextOpen;
    setTimeout(
      this.marketOpenHandler.bind(this),
      this.calculateRemainingTimeInMs(
        nextOpenDate,
        this.sessionEventMarginMs + this.sessionEventMarginTickMs
      )
    );
    this.logger.verbose(`NextOpen at ${getLogStyleStr(nextOpenDate)}`);
    return nextOpenDate;
  }

  private subscribeNextClose(): Date {
    const nextCloseDate = this.session.nextClose;
    setTimeout(
      this.marketCloseHandler.bind(this),
      this.calculateRemainingTimeInMs(
        nextCloseDate,
        this.sessionEventMarginMs + this.sessionEventMarginTickMs
      )
    );
    this.logger.verbose(`NextClose at ${getLogStyleStr(nextCloseDate)}`);
    return nextCloseDate;
  }

  /**
   * @param nextUpdateDate default: nextClose + yahooFinanceUpdateMargin
   */
  private subscribeNextUpdate(nextUpdateDate?: Date): Date {
    nextUpdateDate ||
    (nextUpdateDate = this.addYfUpdateMargin(this.session.nextClose));
    setTimeout(
      this.marketUpdateHandler.bind(this),
      this.calculateRemainingTimeInMs(nextUpdateDate)
    );
    this.logger.verbose(`NextUpdate at ${getLogStyleStr(nextUpdateDate)}`);
    return nextUpdateDate;
  }

  private async marketOpenHandler() {
    try {
      await this.updateSession(() => this.calculateMarketOpen() === true);
      this.logger.verbose(`Open`);
      this.emit(MarketEvent.OPEN, this.subscribeNextEventWhenMarketOpen());
    } catch (e) {
      this.emit("error", e);
      this.subscribe();
      this.logger.warn('marketOpenHandler: subscribe has been called again and completed');
    }
  }

  private async marketCloseHandler() {
    try {
      await this.updateSession(() => this.calculateMarketOpen() === false);
      this.calculateMarketDate();
      this.logger.verbose(`Close`);
      this.emit(MarketEvent.CLOSE, this.subscribeNextEventWhenMarketClose());
    } catch (e) {
      this.emit("error", e);
      this.subscribe();
      this.logger.warn(`marketCloseHandler: subscribe has been called again and completed`);
    }
  }

  private async updateSession(
    check: () => boolean,
    retry = 0
  ) {
    await this.session.updateSession();
    if (check()) {
      0 < retry && this.logger.warn(`updateSession retry: ${retry}`);
      return;
    } else {
      await F.delay(this.sessionEventMarginTickMs);
      await this.updateSession(check, retry + 1);
    }
  }

  private marketUpdateHandler() {
    this.logger.verbose(`Update`);
    this.emit(MarketEvent.UPDATE, this);
  }

  /**
   * 
   * @param add ms
   */
  private calculateRemainingTimeInMs(
    date: Date,
    add: number = 0
  ): number {
    return date.getTime() - new Date().getTime() + add;
  }

  private addYfUpdateMargin(date: Date): Date {
    const result = new Date(date);
    result.setMilliseconds(
      result.getMilliseconds() + this.config.yahooFinanceUpdateMargin
    );
    return result;
  }

  private calculateMarketDate(): MarketDate {
    return this.marketDateYmdStr = getISOYmdStr(
      this.session.previousClose,
      this.isoTimezoneName
    );
  }

  private calculateMarketOpen(): boolean {
    return this.marketOpen
    = new Date(this.session.previousOpen) > new Date(this.session.previousClose);
  }

}
