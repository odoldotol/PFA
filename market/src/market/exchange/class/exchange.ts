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
import {
  buildLoggerContext,
  calculateRemainingMs,
  getISOYmdStr,
  getLogStyleStr
} from "src/common/util";

export class Market_Exchange
  extends EventEmitter
  implements OnApplicationBootstrap, ExchangeCore
{
  private readonly logger = new Logger(
    buildLoggerContext(Market_Exchange, this.isoCode)
  );

  private previousCloseYmdStr!: MarketDate;
  private marketOpen!: boolean;

  // Todo: 여전히 필요한가?
  private updaterRegistered = false;

  constructor(
    private readonly config: Market_ExchangeConfig,
    private readonly session: Market_ExchangeSession
  ) {
    super();
    // Todo: error 핸들링
    this.on("error", e => this.logger.error(e, e.stack));
  }

  onApplicationBootstrap() {
    this.calculateMarketDate();
    this.subscribe();
  }

  public get isoCode(): ExchangeIsoCode {
    return this.config.isoCode;
  }

  public get isoTimezoneName(): IsoTimezoneName {
    return this.config.isoTimezoneName;
  }

  public get marketDate(): MarketDate {
    return this.previousCloseYmdStr;
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

  private subscribe(): OpenEventArg | CloseEventArg {
    return (
      this.calculateMarketOpen() &&
      this.session.nextClose < this.session.nextOpen // 다음 오픈이 다음 클로즈보다 같거나 먼저라면, 마켓은 오픈이자만 이벤트 사이클상에서는 지금이 닫힌상태라고 봐야한다. (항상 오픈인 시장이 이에 해당함.)
    ) ?
    this.subscribeEventWhenMarketOpen() :
    this.subscribeEventWhenMarketClose();
  }

  private subscribeEventWhenMarketOpen(): OpenEventArg {
    return {
      closeDate: this.subscribeClose(),
    };
  }
  
  private subscribeEventWhenMarketClose(): CloseEventArg {
    return {
      updateDate: this.subscribeUpdate(),
      nextOpenDate: this.subscribeNextOpen()
    };
  }

  /**
   * marketOpen === false 일때만 호출 기대
   */
  private subscribeNextOpen(): Date {
    setTimeout(
      this.marketOpenHandler.bind(this),
      calculateRemainingMs(this.session.nextOpen)
    );
    this.logger.verbose(
      `NextOpen at ${getLogStyleStr(this.session.nextOpen)}`
    );
    return this.session.nextOpen;
  }

  /**
   * marketOpen === true 일때만 호출 기대
   */
  private subscribeClose(): Date {
    setTimeout(
      this.marketCloseHandler.bind(this),
      calculateRemainingMs(this.session.nextClose)
    );
    this.logger.verbose(
      `Close at ${getLogStyleStr(this.session.nextClose)}`
    );
    return this.session.nextClose;
  }

  /**
   * marketOpen === false 일때만 호출 기대
   * 
   * - previousClose + yahooFinanceUpdateMargin 에 업데이트 이벤트 예약. return 값은 예약된 시간.
   * - 만약 이미 지났다면 이벤트 즉시 예약. return 값은 null.
   * 
   * @todo refac
   */
  private subscribeUpdate(): Date | null {

    const previousCloseAddYfUpdateMargin
    = new Date(this.session.previousClose);
    
    previousCloseAddYfUpdateMargin
    .setMilliseconds(this.config.yahooFinanceUpdateMargin);

    const timeoutMs
    = calculateRemainingMs(previousCloseAddYfUpdateMargin);

    setTimeout(
      this.marketUpdateHandler.bind(this),
      timeoutMs
    );

    if (0 < timeoutMs) {
      this.logger.verbose(
        `Update at ${getLogStyleStr(previousCloseAddYfUpdateMargin)}`
      );
      return previousCloseAddYfUpdateMargin;
    } else {
      return null;
    }
  }

  private async marketOpenHandler() {
    try {
      await this.session.updateSession();
      this.emit(MarketEvent.OPEN, this.subscribe());
    } catch (e) {
      this.emit("error", e);
      this.subscribe();
      this.logger.warn(
        'marketOpenHandler: subscribe has been called again and completed'
      );
    }
  }

  private async marketCloseHandler() {
    try {
      await this.session.updateSession();
      this.calculateMarketDate();
      this.emit(MarketEvent.CLOSE, this.subscribe());
    } catch (e) {
      this.emit("error", e);
      this.subscribe();
      this.logger.warn(
        `marketCloseHandler: subscribe has been called again and completed`
      );
    }
  }

  /**
   * 리스너가 있을떄만 이벤트 방출
   */
  private marketUpdateHandler() {
    if (this.listenerCount(MarketEvent.UPDATE) !== 0) {
      this.logger.verbose(`Update`);
      this.emit(MarketEvent.UPDATE, this);
    }
  }

  private calculateMarketDate(): MarketDate {
    return this.previousCloseYmdStr = getISOYmdStr(
      this.session.previousClose,
      this.isoTimezoneName
    );
  }

  private calculateMarketOpen(): boolean {
    (this.marketOpen
    = this.session.previousClose <= this.session.previousOpen) ?
      this.logger.verbose(`Open`) :
      this.logger.verbose(`Close`);
    return this.marketOpen;
  }

}
