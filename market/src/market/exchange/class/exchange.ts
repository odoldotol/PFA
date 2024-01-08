import { Logger, OnApplicationBootstrap } from "@nestjs/common";
import { EventEmitter } from "stream";
import { Market_ExchangeConfig } from "./exchangeConfig";
import { Market_ExchangeSession } from "./exchangeSession";
import {
  CoreExchange,
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

export class Market_Exchange
  extends EventEmitter
  implements OnApplicationBootstrap, CoreExchange
{
  private readonly logger = new Logger(
    buildLoggerContext(Market_Exchange, this.isoCode)
  );

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

  public onApplicationBootstrap() {
    if (this.calculateMarketOpen()) {
      this.subscribeNextEventWhenMarketOpen();
    } else {
      this.subscribeNextEventWhenMarketClose();
      let nextUpdateDate;
      (nextUpdateDate = this.isInMarginGap()) &&
        this.subscribeNextUpdate(nextUpdateDate);
    }
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

  private subscribeNextEventWhenMarketOpen(): OpenEventArg {
    return {
      nextCloseDate: this.subscribeNextClose(),
      nextUpdateDate: this.subscribeNextUpdate()
    };
  }
  
  private subscribeNextEventWhenMarketClose(): CloseEventArg {
    return { nextOpenDate: this.subscribeNextOpen() };
  }

  private subscribeNextOpen(): Date {
    const nextOpenDate = this.session.nextOpen;
    setTimeout(
      this.marketOpenHandler.bind(this),
      this.calculateRemainingTimeInMs(nextOpenDate)
    );
    this.logger.verbose(`NextOpen at ${getLogStyleStr(nextOpenDate)}`);
    return nextOpenDate;
  }

  private subscribeNextClose(): Date {
    const nextCloseDate = this.session.nextClose;
    setTimeout(
      this.marketCloseHandler.bind(this),
      this.calculateRemainingTimeInMs(nextCloseDate)
    );
    this.logger.verbose(`NextClose at ${getLogStyleStr(nextCloseDate)}`);
    return nextCloseDate;
  }

  private subscribeNextUpdate(nextUpdateDate?: Date): Date {
    nextUpdateDate || (nextUpdateDate = this.getNextUpdateDate());
    setTimeout(
      this.marketUpdateHandler.bind(this),
      this.calculateRemainingTimeInMs(nextUpdateDate)
    );
    this.logger.verbose(`NextUpdate at ${getLogStyleStr(nextUpdateDate)}`);
    return nextUpdateDate;
  }

  private async marketOpenHandler() {
    try {
      await this.session.updateSession();
      this.openMarket();
      this.emit(MarketEvent.OPEN, this.subscribeNextEventWhenMarketOpen());
    } catch (e) {
      this.emit("error", e);
      this.onApplicationBootstrap();
      this.logger.warn('marketOpenHandler: onApplicationBootstrap has been called again and completed');
    }
  }

  private async marketCloseHandler() {
    try {
      await this.session.updateSession();
      this.calculateMarketDate();
      this.closeMarket();
      this.emit(MarketEvent.CLOSE, this.subscribeNextEventWhenMarketClose());
    } catch (e) {
      this.emit("error", e);
      this.onApplicationBootstrap();
      this.logger.warn(`marketCloseHandler: onApplicationBootstrap has been called again and completed`);
    }
  }

  private marketUpdateHandler() {
    this.logger.verbose(`Update`);
    this.emit(MarketEvent.UPDATE, this);
  }

  private openMarket(): void {
    this.marketOpen = true;
    this.logger.verbose(`Open`);
  }

  private closeMarket(): void {
    this.marketOpen = false;
    this.logger.verbose(`Close`);
  }

  private calculateRemainingTimeInMs(date: Date) {
    return date.getTime() - new Date().getTime();
  }

  /**
   * ### 다음 정규장의 업데이트 Date 를 반환한다.
   * - 주의: 현재 세션이 YF_margin_gap 내부에 있어도 건넌뛰고 다음 정규장을 반환함
   */
  private getNextUpdateDate(): Date {
    const nextUpdateDate = new Date(this.session.nextClose);
    nextUpdateDate.setMilliseconds(
      nextUpdateDate.getMilliseconds() + this.config.yahooFinanceUpdateMargin
    );
    return nextUpdateDate;
  }

  /**
   * ### 현재 세션이 YF_margin_gap 내부에 있는지 판단
   * 아니면 false 반환하지만 내부에 있다면 다음 nextUpdateDate 를 반환한다.
   */
  private isInMarginGap() {
    const now = new Date();
    const previousCloseDate = this.session.previousClose;
    const previousCloseAddeMarginDate = new Date(previousCloseDate);
    previousCloseAddeMarginDate.setMilliseconds(
      previousCloseAddeMarginDate.getMilliseconds() + this.config.yahooFinanceUpdateMargin
    );
    return previousCloseDate < now && now < previousCloseAddeMarginDate &&
    previousCloseAddeMarginDate;
  }

  private calculateMarketDate(): MarketDate {
    return this.marketDateYmdStr = getISOYmdStr(this.session.previousClose);
  }

  private calculateMarketOpen(): boolean {
    return this.marketOpen
    = new Date(this.session.previousOpen) > new Date(this.session.previousClose);
  }

}
