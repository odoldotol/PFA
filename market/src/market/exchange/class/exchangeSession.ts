import { InternalServerErrorException, Logger, OnModuleInit } from "@nestjs/common";
import { ExchangeSessionApiService } from "src/market/childApi";
import { ExchangeIsoCode } from "src/common/interface";
import { ExchangeSession } from "src/market/interface";
import { ChildResponseEcSession } from "src/market/childApi/interface";
import { YAHOO_FINANCE_CCC_EXCHANGE_ISO_CODE } from "src/config";
import {
  EVENT_MARGIN_DEFAULT,
  EVENT_TICK,
  UPDATE_RETRY_LIMIT
} from "../const"; // Temporary
import {
  buildLoggerContext,
  calculateElapsedMs,
  getISOYmdStr,
  isHttpResponse4XX,
  retryUntilResolvedOrTimeout
} from "src/common/util";
import * as F from '@fxts/core';
import * as X from 'rxjs';

export class Market_ExchangeSession
  implements OnModuleInit, ExchangeSession
{
  private readonly logger = new Logger(
    buildLoggerContext(Market_ExchangeSession, this.isoCode)
  );

  // todo: ! 어썰션 제거
  private session!: ExchangeSession;

  /**
   * 세션의 최신화 상태와 업데이트동안 마진구간에서 지난 시간을 표현
   * @todo refac
   */
  private elapsedMsSinceNext!: number

  constructor(
    private readonly isoCode: ExchangeIsoCode,
    private readonly exchangeSessionApiSrv: ExchangeSessionApiService
  ) {}

  async onModuleInit() {
    try {
      await this.fetchAndSetSession();
      await this.updateSession();
    } catch (e: any) {
      this.logger.error(e, e.stack);
      this.logger.verbose("Failed to initialize");
      process.exit(1);
    }
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

  /**
   * 세션 최신화
   * @param retry number (-1: 최초 호출, 0: 정상 시도, 1 이상: 재시도)
   * 
   * @todo refac
   */
  public async updateSession(
    retry = -1
  ): Promise<ExchangeSession> {
    /**
     * elapsedMsSinceNext === 0 이면 세션은 최신화된 것으로, 업데이트할 필요가 없음.
     * 최초 시도에서 elapsedMsSinceNext < 마진기본값 이면 마진기본값을 기다린 다음 업데이트해야함. 아니면 바로 업데이트.
     * 이후 시도부터는 마진틱 만큼 기다리고 업데이트 시도.
     */

    // 세션이 최신상태.
    if (this.calculateElapsedMsSinceNext() === 0) {
      retry === -1 && this.logger.verbose(`Session is already up-to-date`);
      0 < retry && this.logger.verbose(`UpdateSession retry: ${retry}`);
      return this.session;
    }
    
    // retry limit exceeded
    if (UPDATE_RETRY_LIMIT <= retry) {
      // 여기 진입하면 1 영업일간 MarketDate 에 문제생길 수 있음.
      // 오픈, 클로즈, 업데이트 이벤트 일정에는 문제 없을것임.
      this.logger.error(
        `UpdateSession retry limit exceeded | retry: ${retry} | elapsedMsSinceNext: ${this.elapsedMsSinceNext}`
      );
      return this.session;
    }

    // delay
    if (retry === -1) {
      const remainingMsUntilMarginDefault
      = EVENT_MARGIN_DEFAULT - this.elapsedMsSinceNext;
      0 < remainingMsUntilMarginDefault &&
      await F.delay(remainingMsUntilMarginDefault);
    } else {
      await F.delay(EVENT_TICK);
    }

    await this.fetchAndSetSession();
    return this.updateSession(retry + 1);
  }

  /**
   * @todo 세션 업데이트 실패시 어떤 영향을 미칠지 테스트하기
   */
  private async fetchAndSetSession(): Promise<ExchangeSession> {
    if (this.isoCode === YAHOO_FINANCE_CCC_EXCHANGE_ISO_CODE) {
      this.session = this.getMidnightUTCSession();
    } else {
      await this.fetchExchangeSession(this.isoCode)
      .then(session => this.session = session);
    }
    this.calculateElapsedMsSinceNext();
    return this.session;
  };

  private async fetchExchangeSession(
    isoCode: ExchangeIsoCode
  ): Promise<ExchangeSession> {
    const task = async () =>
      X.lastValueFrom(await this.exchangeSessionApiSrv.fetchEcSession(isoCode));

    return retryUntilResolvedOrTimeout(task, {
      interval: 10,
      timeout: 1000 * 30,
      rejectCondition: isHttpResponse4XX
    })
    .then(this.getExchangeSession)
    .catch(e => {
      throw new InternalServerErrorException(e);
    });
  }

  private getExchangeSession(
    session: ChildResponseEcSession
  ): ExchangeSession {
    return {
      previousOpen: new Date(session.previous_open),
      previousClose: new Date(session.previous_close),
      nextOpen: new Date(session.next_open),
      nextClose: new Date(session.next_close),
    };
  }

  /**
   * @todo refac
   */
  private calculateElapsedMsSinceNext(): number {
    // nextOpen 과 nextClose 가 모두 현재보다 미래라면, 세션은 최신화된 것임. elapsedMsSinceNext === 0
    return this.elapsedMsSinceNext
    = calculateElapsedMs(this.session.nextOpen) ||
    calculateElapsedMs(this.session.nextClose);
  }

  /**
   * ### [Temporary Method]
   * @todo Crypto currency 는 다른 API 를 사용하는게 맞다.
   */
  private getMidnightUTCSession(): ExchangeSession {
    const previousMidnight = new Date(getISOYmdStr(new Date()));
    const nextMidnight = new Date(previousMidnight);
    nextMidnight.setUTCDate(nextMidnight.getUTCDate() + 1);
    return {
      previousOpen: previousMidnight,
      previousClose: previousMidnight,
      nextOpen: nextMidnight,
      nextClose: nextMidnight,
    };
  }

}
