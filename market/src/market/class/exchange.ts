import { Either } from "src/common/class/either";
import { TExchangeConfig } from "src/config/const/exchanges.const";
import { YF_CCC_ISO_Code, YF_update_margin_default } from "src/config/const/yf.const";
import { EventEmitter } from "stream";
import { ChildApiService } from "../child-api/child-api.service";
import {
  TExchangeSession,
  TExchangeSessionError
} from "../type/exchangeSession.type";

export class Exchange extends EventEmitter {

  public readonly market: string;
  public readonly ISO_Code: string; // id
  public readonly ISO_TimezoneName: string;
  public readonly YF_update_margin: number;
  private readonly childApiSrv: ChildApiService;
  private session?: TExchangeSession;
  private isSubscribed = false;
  private isMarketOpen?: boolean;
  private marketDate?: string;

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

  public async subscribe() {
    if (this.isSubscribed) {
      throw new Error("Already subscribed");
    }
    await this.updateSession();
    this.calculateIsMarketOpen();
    this.calculateMarketDate();
    this.subscribeNextOpen();
    this.subscribeNextClose();
    this.isSubscribed = true;
  }

  private async updateSession() {
    this.session = await this.fetchExchangeSession(this.ISO_Code)
    .then(either => either.getRight);
  }

  private fetchExchangeSession(
    ISO_Code: string
  ): Promise<Either<TExchangeSessionError, TExchangeSession>> {
    if (ISO_Code === YF_CCC_ISO_Code) {
      return Promise.resolve(Either.right(this.getMidnightUTCSession()));
    } else {
      return this.childApiSrv.fetchEcSession(ISO_Code);
    }
  };

  private calculateIsMarketOpen() {
    const { previous_open, previous_close } = this.getSesstion();
    this.isMarketOpen = new Date(previous_open) > new Date(previous_close);
  }

  private calculateMarketDate() {
    this.marketDate = new Date(this.getSesstion().previous_close).toISOString();
  }

  private subscribeNextOpen() {
    const nextOpenDate = new Date(this.getSesstion().next_open);
    setTimeout(
      this.marketOpenHandler.bind(this),
      this.calRemainingTimeInMs(nextOpenDate)
    );
  }

  private subscribeNextClose() {
    const nextCloseDate = new Date(this.getSesstion().next_close);
    setTimeout(
      this.marketCloseHandler.bind(this),
      this.calRemainingTimeInMs(nextCloseDate)
    );
  }

  private getSesstion() {
    if (!this.session) {
      throw new Error("session is not defined");
    }
    return this.session;
  }

  private async marketOpenHandler() {
    try {
      this.isMarketOpen = true;
      await this.updateSession();
      this.emit("market.open", this);
      this.subscribeNextOpen();
    } catch (e) {
      this.emit("error", e);
    }
  }

  private async marketCloseHandler() {
    try {
      this.isMarketOpen = false;
      await this.updateSession();
      this.calculateMarketDate();
      this.emit("market.close", this);
      this.subscribeNextClose();
    } catch (e) {
      this.emit("error", e);
    }
  }

  private calRemainingTimeInMs(date: Date) {
    return date.getTime() - new Date().getTime();
  }

  /**
   * #### UTC 기준 당일 자정과 익일 자정기준으로 마켓세션 생성해서 반환
   */
  private getMidnightUTCSession(): TExchangeSession {
    const previousMidnight = new Date(
      new Date().toISOString().slice(0, 10)
    );
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
