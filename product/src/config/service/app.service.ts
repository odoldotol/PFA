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

  constructor(
    private readonly configSrv: ConfigService<AppEnvironmentVariables>,
  ) {}

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

  private getDockerEnv(): DockerEnv | undefined {
    return this.configSrv.get(AppEnvKey.DOCKER_ENV, { infer: true });
  }
}
