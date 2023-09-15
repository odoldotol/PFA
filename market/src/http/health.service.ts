import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom, tap } from 'rxjs';
import { HEALTH_URI } from 'src/common/const';
import { HttpService } from './http.service';

@Injectable()
export class HealthService {

  private readonly logger = new Logger(HealthService.name);

  constructor(
    private readonly httpSrv: HttpService
  ) {}

  public async resolveWhenHealthy() {
    await this.httpSrv.tryUntilResolved(
      1000,
      1000 * 60 * 5,
      this.healthCheck.bind(this)
    );
  }

  private healthCheck() {
    return firstValueFrom(this.httpSrv.get(HEALTH_URI).pipe(
      tap(res => {
        if (res.status !== 200) throw new Error(`Health Check Failed(status code: ${res.status})`);
      }),
    ));
  }

}
