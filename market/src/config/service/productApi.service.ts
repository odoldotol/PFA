import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ProductApiEnvKey } from "../enum";
import { ProductApiEnvironmentVariables } from "../interface";

@Injectable()
export class ProductApiConfigService {

  private readonly LOCAL_BASE_URL = 'http://localhost:7001';
  private readonly DEFAULT_TIMEOUT = 10000;

  constructor(
    private readonly configSrv: ConfigService<ProductApiEnvironmentVariables>,
  ) {}

  public getBaseUrl(): string {
    return this.configSrv.get(
      ProductApiEnvKey.BASE_URL,
      this.LOCAL_BASE_URL,
      { infer: true }
    );
  }

  public getTimeout(): number {
    return this.configSrv.get(
      ProductApiEnvKey.TIMEOUT,
      this.DEFAULT_TIMEOUT,
      { infer: true }
    );
  }
}
