import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DEFAULT_MARKET_API_TIMEOUT } from "../const";
import { MarketApiEnvKey } from "../enum";
import { MarketApiEnvironmentVariables } from "../interface";

@Injectable()
export class MarketApiConfigService {

  private readonly LOCAL_BASE_URL = 'http://127.0.0.1:6001';

  constructor(
    private readonly configSrv: ConfigService<MarketApiEnvironmentVariables>,
  ) {}

  public getBaseUrl(): string {
    return this.configSrv.get(
      MarketApiEnvKey.BASE_URL,
      this.LOCAL_BASE_URL,
      { infer: true }
    );
  }

  public getTimeout(): number {
    return this.configSrv.get(
      MarketApiEnvKey.TIMEOUT,
      DEFAULT_MARKET_API_TIMEOUT,
      { infer: true }
    );
  }
}
