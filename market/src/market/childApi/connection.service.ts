import { Injectable, OnModuleInit } from "@nestjs/common";
import { HealthService } from 'src/http';
import { buildLoggerContext } from 'src/common/util';
import { Loggable } from "src/logger";

@Injectable()
export class ConnectionService
  extends Loggable
  implements OnModuleInit
{
  constructor(
    private readonly healthSrv: HealthService,
  ) {
    super(buildLoggerContext("ChildApi", ConnectionService.name));
  }

  async onModuleInit() {
    await this.checkHealth();
    this.logger.log("Healthy");
  }

  async checkHealth() {
    return this.healthSrv.resolveWhenHealthy();
  }
}
