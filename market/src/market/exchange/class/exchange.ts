import { Logger, OnApplicationBootstrap } from "@nestjs/common";
import { toLoggingStyle, toISOYmdStr } from "src/common/util/date";
import { EventEmitter } from "stream";
import { EMarketEvent } from "../enum/eventName.enum";
import { TCloseEventArg, TOpenEventArg } from "../type";
import { buildLoggerContext } from "src/common/util";
import { Market_ExchangeConfig } from "./exchangeConfig";
import { Market_ExchangeSession } from "./exchangeSession";

// Todo: 다시 Scheduler 사용하던가 스트림패턴 적용하든 이벤트 관리에만 집중하는 클래스 따로 만들자
export class Market_Exchange extends EventEmitter implements OnApplicationBootstrap {
  private readonly logger = new Logger(buildLoggerContext(Market_Exchange, this.ISO_Code));

  private marketDateYmdStr!: string;
  private marketOpen!: boolean;

  // Todo: 여전히 필요한가?
  private updaterRegistered = false;

  constructor(
    private readonly config: Market_ExchangeConfig,
    private readonly session: Market_ExchangeSession
  ) {
    super();
    this.on("error", e => this.logger.error(e)); //
  }

  onApplicationBootstrap() {
    if (this.calculateMarketOpen()) {
      this.subscribeNextEventWhenMarketOpen();
    } else {
      this.subscribeNextEventWhenMarketClose();
      let nextUpdateDate
      (nextUpdateDate = this.isInMarginGap()) && this.subscribeNextUpdate(nextUpdateDate);
    }
    this.calculateMarketDate();
  }

  public get ISO_Code(): Market_ExchangeConfig["ISO_Code"] {
    return this.config.ISO_Code;
  }

  public get ISO_TimezoneName(): Market_ExchangeConfig["ISO_TimezoneName"] {
    return this.config.ISO_TimezoneName;
  }

  public get marketDate(): string {
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

  private subscribeNextEventWhenMarketOpen(): TOpenEventArg {
    return {
      nextCloseDate: this.subscribeNextClose(),
      nextUpdateDate: this.subscribeNextUpdate()
    };
  }
  
  private subscribeNextEventWhenMarketClose(): TCloseEventArg {
    return { nextOpenDate: this.subscribeNextOpen() };
  }

  private subscribeNextOpen(): Date {
    const nextOpenDate = this.session.nextOpen;
    setTimeout(
      this.marketOpenHandler.bind(this),
      this.calculateRemainingTimeInMs(nextOpenDate)
    );
    this.logger.verbose(`NextOpen at ${toLoggingStyle(nextOpenDate)}`);
    return nextOpenDate;
  }

  private subscribeNextClose(): Date {
    const nextCloseDate = this.session.nextClose;
    setTimeout(
      this.marketCloseHandler.bind(this),
      this.calculateRemainingTimeInMs(nextCloseDate)
    );
    this.logger.verbose(`NextClose at ${toLoggingStyle(nextCloseDate)}`);
    return nextCloseDate;
  }

  private subscribeNextUpdate(nextUpdateDate?: Date): Date {
    nextUpdateDate || (nextUpdateDate = this.getNextUpdateDate());
    setTimeout(
      this.marketUpdateHandler.bind(this),
      this.calculateRemainingTimeInMs(nextUpdateDate)
    );
    this.logger.verbose(`NextUpdate at ${toLoggingStyle(nextUpdateDate)}`);
    return nextUpdateDate;
  }

  private async marketOpenHandler() {
    try {
      await this.session.updateSession();
      this.openMarket();
      this.emit(EMarketEvent.OPEN, this.subscribeNextEventWhenMarketOpen());
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
      this.emit(EMarketEvent.CLOSE, this.subscribeNextEventWhenMarketClose());
    } catch (e) {
      this.emit("error", e);
      this.onApplicationBootstrap();
      this.logger.warn(`marketCloseHandler: onApplicationBootstrap has been called again and completed`);
    }
  }

  private marketUpdateHandler() {
    this.logger.verbose(`Update`);
    this.emit(EMarketEvent.UPDATE);
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
      nextUpdateDate.getMilliseconds() + this.config.YF_update_margin
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
      previousCloseAddeMarginDate.getMilliseconds() + this.config.YF_update_margin
    );
    return previousCloseDate < now && now < previousCloseAddeMarginDate &&
    previousCloseAddeMarginDate;
  }

  private calculateMarketDate(): string {
    return this.marketDateYmdStr = toISOYmdStr(this.session.previousClose);
  }

  private calculateMarketOpen(): boolean {
    return this.marketOpen
    = new Date(this.session.previousOpen) > new Date(this.session.previousClose);
  }

}
