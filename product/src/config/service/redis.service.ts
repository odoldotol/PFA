import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DEFAULT_REDIS_URL } from "../const";
import { RedisEnvKey } from "../enum";
import { RedisEnviromentVariables } from "../interface";

@Injectable()
export class RedisConfigService {

  constructor(
    private readonly configSrv: ConfigService<RedisEnviromentVariables>,
  ) {}

  public getUrl(): string {
    return this.configSrv.get(
      RedisEnvKey.URL,
      DEFAULT_REDIS_URL,
      { infer: true }
    );
  }
}
