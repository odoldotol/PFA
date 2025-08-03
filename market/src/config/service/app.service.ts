import {
  Injectable,
  Logger
} from "@nestjs/common";
import { ConfigService } from '@nestjs/config';
import { DEFAULT_PORT } from "../const";
import {
  AppEnvKey,
  DockerEnv
} from "../enum";
import { AppEnvironmentVariables } from "../interface";

@Injectable()
export class AppConfigService {
  private readonly logger = new Logger(AppConfigService.name);

  private readonly IS_MARKET_UPDATE_DISABLED = Number(this.configSrv.get(AppEnvKey.DISABLE_MARKET_UPDATE, { infer: true })) === 1;

  constructor(
    private readonly configSrv: ConfigService<AppEnvironmentVariables>,
  ) {
    if (this.IS_MARKET_UPDATE_DISABLED) {
      this.logger.warn("Market update is disabled.");
    }
  }

  public getPort(): number {
    return this.configSrv.get(
      AppEnvKey.PORT,
      DEFAULT_PORT,
      { infer: true }
    );
  }

  public isProduction(): boolean {
    return this.getDockerEnv() === DockerEnv.PRODUCTION;
  }

  public isDockerDevelopment(): boolean {
    return this.getDockerEnv() === DockerEnv.DEVELOPMENT;
  }

  public isMarketUpdateDisabled(): boolean {
    return this.IS_MARKET_UPDATE_DISABLED;
  }

  private getDockerEnv(): DockerEnv | undefined {
    return this.configSrv.get(AppEnvKey.DOCKER_ENV, { infer: true });
  }
}
