import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { firstValueFrom, tap } from 'rxjs';
import { HEALTH_URN, HEALTHCHECK_INTERVAL, HEALTHCHECK_TIMEOUT } from 'src/common/const';
import { HttpService } from './http.service';

@Injectable()
export class HealthService {

  constructor(
    private readonly httpSrv: HttpService
  ) {}

  public async resolveWhenHealthy() {
    await this.httpSrv.intervalTryUntilRespondOrTimeout(
      HEALTHCHECK_INTERVAL,
      HEALTHCHECK_TIMEOUT,
      this.healthCheck.bind(this)
    );
  }

  private healthCheck() {
    const throwErrorIfHealthStatusIsNot200 = tap((res: AxiosResponse) => {
      if (res.status !== 200) throw new Error(`Health Check Failed(status code: ${res.status})`);
    });

    return firstValueFrom(this.httpSrv.get(HEALTH_URN).pipe(throwErrorIfHealthStatusIsNot200));
  }
}
