import { Logger } from "@nestjs/common";
import { Either } from "src/common/class/either";
import { toLoggingStyle, toISOYmdStr } from "src/common/util/date";
import { TExchangeConfig } from "src/config/const/exchanges.const";
import { YF_CCC_ISO_Code, YF_update_margin_default } from "src/config/const/yf.const";
import { EventEmitter } from "stream";
import { ChildApiService } from "../../child_api/child_api.service";
import { EMarketEvent } from "../enum/eventName.enum";
import { TCloseEventArgs, TOpenEventArgs } from "../type";
import { TExchangeSession, TFailure as TChildApiFailure } from "../../child_api/type";

// Todo: 다시 Scheduler 사용하던가 스트림패턴 적용하든 이벤트 관리에만 집중하는 클래스 따로 만들자
export class Exchange extends EventEmitter {
  private readonly logger = new Logger(Exchange.name);

  public readonly market: string;
  public readonly ISO_Code: string; // id
  public readonly ISO_TimezoneName: string;
  public readonly YF_update_margin: number;
  private readonly childApiSrv: ChildApiService;
  private session?: TExchangeSession;
  private isInitiated = false;
  private isRegisteredUpdater = false;
  private marketOpen?: boolean;
  private marketDate?: Date;

  constructor(
    exchangeConfig: TExchangeConfig,
    childApiSrv: ChildApiService
  ) {
    super();
    this.market = exchangeConfig.market;
    this.ISO_Code = exchangeConfig.ISO_Code;
    this.ISO_TimezoneName = exchangeConfig.ISO_TimezoneName;
    this.YF_update_margin = exchangeConfig.YF_update_margin || YF_update_margin_default;
    this.childApiSrv = childApiSrv;
  }

  public async initiate() {
    if (this.isInitiated) {
      throw new Error("Already Initiated");
    }
    await this.updateSession();
    const marketOpen = this.calculateMarketOpen()
    if (marketOpen) {
      this.executeSubscribesWhenOpen();
    } else {
      this.executeSubscribesWhenClose();
      const nextUpdateDate = this.isInMarginGap();
      nextUpdateDate && this.subscribeNextUpdate(nextUpdateDate);
    }
    this.calculateMarketDate();
    this.isInitiated = true;
  }

  public getMarketDate() {
    if (!this.marketDate) {
      throw new Error("marketDate is not defined");
    }
    return this.marketDate;
  }

  public getMarketDateYmdStr() {
    return toISOYmdStr(this.getMarketDate());
  }

  public isMarketOpen() {
    if (this.marketOpen === undefined) {
      throw new Error("isMarketOpen is not defined");
    }
    return this.marketOpen;
  }

  public setIsRegisterdUpdaterTrue() {
    this.isRegisteredUpdater = true;
  }

  public getIsRegisteredUpdater() {
    return this.isRegisteredUpdater;
  }

  private async updateSession() {
    this.session = await this.fetchExchangeSession(this.ISO_Code)
    .then(either => either.getRight);
  }

  private fetchExchangeSession(
    ISO_Code: string
  ): Promise<Either<TChildApiFailure, TExchangeSession>> {
    if (ISO_Code === YF_CCC_ISO_Code) {
      return Promise.resolve(Either.right(this.getMidnightUTCSession()));
    } else {
      return this.childApiSrv.fetchEcSession(ISO_Code);
    }
  };

  private calculateMarketOpen() {
    const { previous_open, previous_close } = this.getSesstion();
    this.marketOpen = new Date(previous_open) > new Date(previous_close);
    return this.marketOpen;
  }

  private calculateMarketDate() {
    this.marketDate = new Date(this.getSesstion().previous_close);
  }

  private subscribeNextOpen(nextOpenDate: Date) {
    setTimeout(
      this.marketOpenHandler.bind(this),
      this.calculateRemainingTimeInMs(nextOpenDate)
    );
    this.logger.verbose(
      `${this.ISO_Code} : NextOpen at ${toLoggingStyle(nextOpenDate)}`);
  }

  private subscribeNextClose(nextCloseDate: Date) {
    setTimeout(
      this.marketCloseHandler.bind(this),
      this.calculateRemainingTimeInMs(nextCloseDate)
    );
    this.logger.verbose(
      `${this.ISO_Code} : NextClose at ${toLoggingStyle(nextCloseDate)}`);
  }

  private subscribeNextUpdate(nextUpdateDate: Date) {
    setTimeout(
      this.marketUpdateHandler.bind(this),
      this.calculateRemainingTimeInMs(nextUpdateDate)
    );
    this.logger.verbose(
      `${this.ISO_Code} : NextUpdate at ${toLoggingStyle(nextUpdateDate)}`);
  }

  private getSesstion() {
    if (!this.session) {
      throw new Error("session is not defined");
    }
    return this.session;
  }

  private async marketOpenHandler() {
    try {
      this.marketOpen = true;
      await this.updateSession();
      this.logger.verbose(`${this.ISO_Code} : Open`);
      const { nextCloseDate, nextUpdateDate } = this.executeSubscribesWhenOpen();
      const openEventArgs: TOpenEventArgs = [ nextCloseDate, nextUpdateDate ];
      this.emit(EMarketEvent.OPEN, ...openEventArgs);
    } catch (e) {
      this.emit("error", e);
    }
  }

  private async marketCloseHandler() {
    try {
      this.marketOpen = false;
      await this.updateSession();
      this.calculateMarketDate();
      this.logger.verbose(`${this.ISO_Code} : Close`);
      const { nextOpenDate } = this.executeSubscribesWhenClose();
      const closeEventArgs: TCloseEventArgs = [ nextOpenDate ];
      this.emit(EMarketEvent.CLOSE, ...closeEventArgs);
    } catch (e) {
      this.emit("error", e);
    }
  }

  private marketUpdateHandler() {
    this.logger.verbose(`${this.ISO_Code} : Update`);
    this.emit(EMarketEvent.UPDATE);
  }

  private executeSubscribesWhenOpen() {
    const nextCloseDate = this.getNextCloseDate();
    const nextUpdateDate = this.getNextUpdateDate(nextCloseDate);
    this.subscribeNextClose(nextCloseDate);
    this.subscribeNextUpdate(nextUpdateDate);
    return { nextCloseDate, nextUpdateDate };
  }
  
  private executeSubscribesWhenClose() {
    const nextOpenDate = this.getNextOpenDate();
    this.subscribeNextOpen(nextOpenDate);
    return { nextOpenDate };
  }

  private calculateRemainingTimeInMs(date: Date) {
    return date.getTime() - new Date().getTime();
  }

  private getNextOpenDate() {
    return new Date(this.getSesstion().next_open);
  }

  private getNextCloseDate() {
    return new Date(this.getSesstion().next_close);
  }

  private getNextUpdateDate(nextCloseDate: Date) {
    const nextUpdateDate = new Date(nextCloseDate);
    nextUpdateDate.setMilliseconds(nextUpdateDate.getMilliseconds() + this.YF_update_margin);
    return nextUpdateDate;
  }

  private isInMarginGap() {
    const now = new Date();
    const previousCloseDate = new Date(this.getSesstion().previous_close);
    const previousCloseAddeMarginDate = new Date(previousCloseDate);
    previousCloseAddeMarginDate
      .setMilliseconds(previousCloseAddeMarginDate.getMilliseconds() + this.YF_update_margin);
    return previousCloseDate < now && now < previousCloseAddeMarginDate && previousCloseAddeMarginDate;
  }

  /**
   * #### UTC 기준 당일 자정과 익일 자정기준으로 마켓세션 생성해서 반환
   */
  private getMidnightUTCSession(): TExchangeSession {
    const previousMidnight = new Date(toISOYmdStr(new Date()));
    const nextMidnight = previousMidnight;
    nextMidnight.setUTCDate(nextMidnight.getUTCDate() + 1);
    const previous = previousMidnight.toISOString();
    const next = nextMidnight.toISOString();
    return {
      previous_open: previous,
      previous_close: previous,
      next_open: next,
      next_close: next
    };
  }

}
