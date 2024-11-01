import { Injectable } from "@nestjs/common";
import { ConfigService } from '@nestjs/config';
import { DEFAULT_PORT } from "../const";
import {
  AppEnvKey,
  DockerEnv
} from "../enum";
import { AppEnvironmentVariables } from "../interface";

@Injectable()
export class AppConfigService {

  private readonly IS_MAINTEANCE: boolean;

  constructor(
    private readonly configSrv: ConfigService<AppEnvironmentVariables>,
  ) {
    this.IS_MAINTEANCE = this.readIsMaintenance();
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

  public isMaintenance(): boolean {
    return this.IS_MAINTEANCE;
  }

  private readIsMaintenance(): boolean {
    return Boolean(Number(
      this.configSrv.get(
        AppEnvKey.MAINTENANCE,
        { infer: true }
      )
    ));
  }

  private getDockerEnv(): DockerEnv | undefined {
    return this.configSrv.get(AppEnvKey.DOCKER_ENV, { infer: true });
  }

}
