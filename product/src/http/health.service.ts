import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { firstValueFrom, tap } from 'rxjs';
import {
  HEALTH_PATH,
  HEALTHCHECK_INTERVAL,
  HEALTHCHECK_TIMEOUT
} from './const';
import {
  intervalTryUntilResolvedOrTimeout,
  isHttpResponse4XX,
} from 'src/common/util';
// import { HttpService } from './http.service';

@Injectable()
export class HealthService {

  constructor(
    private readonly httpSrv: HttpService
  ) {}

  public async resolveWhenHealthy() {
    await intervalTryUntilResolvedOrTimeout(
      this.healthCheck.bind(this),
      {
        interval: HEALTHCHECK_INTERVAL,
        timeout: HEALTHCHECK_TIMEOUT,
        rejectCondition: isHttpResponse4XX
      }
    );
  }

  private healthCheck() {
    const throwErrorIfHealthStatusIsNot200 = tap((res: AxiosResponse) => {
      if (res.status !== 200) throw new Error(`Health Check Failed(status code: ${res.status})`);
    });

    return firstValueFrom(this.httpSrv.get(HEALTH_PATH).pipe(throwErrorIfHealthStatusIsNot200));
  }
}
