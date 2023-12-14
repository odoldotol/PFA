import { OnModuleInit } from "@nestjs/common";
import { ChildApiService } from "src/market/child_api/child_api.service";
import { ExchangeIsoCode } from "src/common/interface";
import { ExchangeSession } from "src/market/interface";
import { YAHOO_FINANCE_CCC_EXCHANGE_ISO_CODE } from "src/config/const";
import { getISOYmdStr } from "src/common/util";
import Either from "src/common/class/either";

export class Market_ExchangeSession
  implements OnModuleInit, ExchangeSession
{
  private session!: ExchangeSession;

  constructor(
    private readonly isoCode: ExchangeIsoCode,
    private readonly childApiSrv: ChildApiService
  ) {}

  async onModuleInit() {
    await this.updateSession();
  }

  public get nextOpen(): Date {
    return this.session.nextOpen;
  }

  public get nextClose(): Date {
    return this.session.nextClose;
  }

  public get previousOpen(): Date {
    return this.session.previousOpen;
  }

  public get previousClose(): Date {
    return this.session.previousClose;
  }

  public async updateSession(): Promise<void> {
    await this.fetchExchangeSession(this.isoCode)
    .then(either => {
      this.session = either.right; //
    });
  }

  private fetchExchangeSession(
    isoCode: ExchangeIsoCode
  ): Promise<Either<any, ExchangeSession>> {
    if (isoCode === YAHOO_FINANCE_CCC_EXCHANGE_ISO_CODE) {
      return Promise.resolve(Either.right(this.getMidnightUTCSession()));
    } else {
      return this.childApiSrv.fetchEcSession(isoCode);
    }
  };

  /**
   * ### [Temporary Method]
   * #### UTC 기준 당일 자정과 익일 자정기준으로 마켓세션 생성해서 반환
   * @todo 세션 구성을 설정파일에서 관리하도록 하자.
   */
  private getMidnightUTCSession(): ExchangeSession {
    const previousMidnight = new Date(getISOYmdStr(new Date()));
    const nextMidnight = previousMidnight;
    nextMidnight.setUTCDate(nextMidnight.getUTCDate() + 1);
    return {
      previousOpen: previousMidnight,
      previousClose: previousMidnight,
      nextOpen: nextMidnight,
      nextClose: nextMidnight,
    };
  }

}
