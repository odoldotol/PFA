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

  public subscribe() {
    this.updateSession();
    // 세션 오픈, 마감 이벤트 방출하기
    this.isSubscribed = true;
  }

  private async updateSession() {
    this.session = await this.fetchExchangeSession(this.ISO_Code)
    .then(either => either.getRight)
    .catch(e => { throw e; });
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

}
