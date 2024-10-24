import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { HealthService } from 'src/http';
import { buildLoggerContext } from 'src/common/util';

@Injectable()
export class ConnectionService implements OnModuleInit {

  private readonly logger = new Logger(buildLoggerContext("ChildApi", ConnectionService.name));

  constructor(
    private readonly healthSrv: HealthService,
  ) {}

  async onModuleInit() {
    await this.checkHealth();
    this.logger.log("Healthy");
  }

  async checkHealth() {
    return this.healthSrv.resolveWhenHealthy();
  }
}
