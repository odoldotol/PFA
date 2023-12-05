import { OnModuleInit } from "@nestjs/common";
import { Either } from "src/common/class/either";
import { toISOYmdStr } from "src/common/util";
import {
  TExchangeConfig,
  YF_CCC_ISO_Code
} from "src/config/const";
import { ChildApiService } from "src/market/child_api/child_api.service";
import {
  TExchangeSession,
  TFailure as TChildApiFailure
} from "src/market/child_api/type";

export class Market_ExchangeSession implements OnModuleInit {

  private nextOpenDate!: Date;
  private nextCloseDate!: Date;
  private previousOpenDate!: Date;
  private previousCloseDate!: Date;

  constructor(
    private readonly config: TExchangeConfig,
    private readonly childApiSrv: ChildApiService
  ) {}

  async onModuleInit() {
    await this.updateSession();
  }

  public get ISO_Code(): TExchangeConfig["ISO_Code"] {
    return this.config.ISO_Code;
  }

  public get nextOpen(): Date {
    return this.nextOpenDate;
  }

  public get nextClose(): Date {
    return this.nextCloseDate;
  }

  public get previousOpen(): Date {
    return this.previousOpenDate;
  }

  public get previousClose(): Date {
    return this.previousCloseDate;
  }

  public async updateSession(): Promise<void> {
    await this.fetchExchangeSession(this.ISO_Code)
    .then(either => {
      const session = either.right;
      this.previousOpenDate = new Date(session.previous_open);
      this.previousCloseDate = new Date(session.previous_close);
      this.nextOpenDate = new Date(session.next_open);
      this.nextCloseDate = new Date(session.next_close);
    });
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

  /**
   * ### [Temporary Method]
   * #### UTC 기준 당일 자정과 익일 자정기준으로 마켓세션 생성해서 반환
   * @todo 세션 구성을 설정파일에서 관리하도록 하자.
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
