import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ChildApiService } from './childApi.service';
import { ExchangeIsoCode } from 'src/common/interface';
import { ChildResponseEcSession } from './interface';
import { EXCHANGE_SESSION_URN } from './const';
import { Observable } from 'rxjs';

@Injectable()
export class ExchangeSessionApiService {

  constructor(
    private readonly httpService: HttpService,
    private readonly childApiSrv: ChildApiService,
  ) {}

  public async fetchEcSession(
    isoCode: ExchangeIsoCode
  ): Promise<Observable<ChildResponseEcSession>> {
    const req = () => this.httpService.post<ChildResponseEcSession>(
      EXCHANGE_SESSION_URN + "/" + isoCode
    );

    return this.childApiSrv.withConcurrencyQueue(req);
  }
}
