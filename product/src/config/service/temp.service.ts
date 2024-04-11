import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DEFAULT_TEMP_KEY } from "../const";
import { TempEnvKey } from "../enum";
import { TempEnvironmentVariables } from "../interface";

@Injectable()
export class TempConfigService {

  constructor(
    private readonly configSrv: ConfigService<TempEnvironmentVariables>,
  ) {}

  public getKey(): string {
    return this.configSrv.get(
      TempEnvKey.KEY,
      DEFAULT_TEMP_KEY,
      { infer: true }
    );
  }
}
