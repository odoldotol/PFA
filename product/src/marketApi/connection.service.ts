import { Injectable, OnModuleInit } from '@nestjs/common';
import { HealthService } from 'src/http';
import { Loggable } from 'src/logger';
import { buildLoggerContext } from 'src/common/util';

@Injectable()
export class ConnectionService
  extends Loggable
  implements OnModuleInit
{
  constructor(
    private readonly healthSrv: HealthService,
  ) {
    super(buildLoggerContext("MarketApi", ConnectionService.name));
  }

  async onModuleInit() {
    await this.healthSrv.resolveWhenHealthy();
    this.logger.log("Healthy");
  }

}
