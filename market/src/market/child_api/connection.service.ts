import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { HealthService } from 'src/http/health.service';
import { buildLoggerContext } from 'src/common/util';

@Injectable()
export class ConnectionService implements OnModuleInit {

  private readonly logger = new Logger(buildLoggerContext("ChildApi", ConnectionService.name));

  constructor(
    private readonly healthSrv: HealthService,
  ) {}

  async onModuleInit() {
    this.logger.log("Waiting for Connection...");
    await this.healthSrv.resolveWhenHealthy();
  }

}
