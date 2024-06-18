import { Injectable } from '@nestjs/common';
import { ChildApiService } from './childApi.service';
import { ExchangeIsoCode } from 'src/common/interface';
import { ExchangeSession } from '../interface';
import { ChildError, ChildResponseEcSession } from './interface';
import { EXCHANGE_SESSION_URN } from './const';
import Either, * as E from "src/common/class/either";

@Injectable()
export class ExchangeSessionApiService {

  constructor(
    private readonly childApiSrv: ChildApiService,
  ) {}

  public fetchEcSession(
    isoCode: ExchangeIsoCode
  ): Promise<Either<ChildError, ExchangeSession>> {
    return this.childApiSrv.post<ChildResponseEcSession>(
      EXCHANGE_SESSION_URN + "/" + isoCode
    ).then(E.map(this.getExchangeSession));
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
}
