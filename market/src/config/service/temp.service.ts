import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TempEnvKey } from "../enum";
import { TempEnvironmentVariables } from "../interface";

@Injectable()
export class TempConfigService {

  private readonly DEFAULT_KEY = 'TEMP_KEY';

  constructor(
    private readonly configSrv: ConfigService<TempEnvironmentVariables>,
  ) {}

  getKey(): string {
    return this.configSrv.get(
      TempEnvKey.KEY,
      this.DEFAULT_KEY,
      { infer: true }
    );
  }
}
