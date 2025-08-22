import {
  Injectable
} from "@nestjs/common";
import { ConfigService } from '@nestjs/config';
import { DEFAULT_PORT } from "../const";
import {
  AppEnvKey,
  DockerEnv
} from "../enum";
import { AppEnvironmentVariables } from "../interface";
import { Loggable } from "src/logger";

@Injectable()
export class AppConfigService
  extends Loggable
{
  private readonly IS_MARKET_UPDATE_DISABLED = Number(this.configSrv.get(AppEnvKey.DISABLE_MARKET_UPDATE, { infer: true })) === 1;

  constructor(
    private readonly configSrv: ConfigService<AppEnvironmentVariables>,
  ) {
    super();

    if (this.IS_MARKET_UPDATE_DISABLED) {
      let i = 0;
      while (i < 5) {
        this.logger.warn("Market update is disabled.");
        console.log("Market update is disabled.");
        i++;
      }
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
