import { Injectable } from "@nestjs/common";
import { ConfigService } from '@nestjs/config';
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
    return this.configSrv.get(AppEnvKey.PORT, 6001, { infer: true });
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
