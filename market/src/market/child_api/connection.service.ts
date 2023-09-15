import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { HealthService } from 'src/http/health.service';

@Injectable()
export class ConnectionService implements OnModuleInit {

  private readonly logger = new Logger("ChildApi-" + ConnectionService.name);

  constructor(
    private readonly healthSrv: HealthService,
  ) {}

  async onModuleInit() {
    this.logger.log("Waiting for Connection...");
    await this.healthSrv.resolveWhenHealthy();
  }

}
