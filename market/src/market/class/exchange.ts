import { Either } from "src/common/class/either";
import { TExchangeConfig } from "src/config/const/exchanges.const";
import { YF_CCC_ISO_Code } from "src/config/const/yf_ccc_code.const";
import { EventEmitter } from "stream";
import { ChildApiService } from "../child-api/child-api.service";
import {
  TExchangeSession,
  TExchangeSessionError
} from "../type/exchangeSession.type";

export class Exchange extends EventEmitter {

  private readonly market: string;
  private readonly ISO_Code: string; // id
  private readonly ISO_TimezoneName: string;
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
    this.childApiSrv = childApiSrv;
  }

  get id() {
    return this.ISO_Code;
  }

  public async subscribe() {
    if (this.isSubscribed) {
      throw new Error("Already subscribed");
    }
    await this.updateSession();
    this.calculateIsMarketOpen();
    this.calculateMarketDate();
    this.emitNextOpenEvent();
    this.emitNextCloseEvent();
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

  private calculateIsMarketOpen() {
    const { previous_open, previous_close } = this.getSesstion();
    this.isMarketOpen = new Date(previous_open) > new Date(previous_close);
  }

  private calculateMarketDate() {
    this.marketDate = new Date(this.getSesstion().previous_close).toISOString();
  }

  private emitNextOpenEvent() {
    const { next_open } = this.getSesstion();
    setTimeout(async () => {
      try {
        this.isMarketOpen = true;
        await this.updateSession();
        this.emit("market.open", this);
        this.emitNextOpenEvent();
      } catch (e) {
        this.emit("error", e);
      }
    }, new Date(next_open).getTime() - new Date().getTime());
  }

  private emitNextCloseEvent() {
    const { next_close } = this.getSesstion();
    setTimeout(async () => {
      try {
        this.isMarketOpen = false;
        await this.updateSession();
        this.calculateMarketDate();
        this.emit("market.close", this);
        this.emitNextCloseEvent();
      } catch (e) {
        this.emit("error", e);
      }
    }, new Date(next_close).getTime() - new Date().getTime());
  }

  private getSesstion() {
    if (!this.session) {
      throw new Error("session is not defined");
    }
    return this.session;
  }

}
