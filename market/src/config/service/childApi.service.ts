import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ChildApiEnvKey } from "../enum";
import { ChildApiEnvironmentVariables } from "../interface";

@Injectable()
export class ChildApiConfigService {

  private readonly LOCAL_BASE_URL = 'http://127.0.0.1:8001';
  private readonly DEFAULT_TIMEOUT = 30000;
  private readonly DEFAULT_WORKERS = 1;
  private readonly DEFAULT_CONCURRENCY = 50;

  constructor(
    private readonly configSrv: ConfigService<ChildApiEnvironmentVariables>,
  ) {}

  public getBaseUrl(): string {
    return this.configSrv.get(
      ChildApiEnvKey.BASE_URL,
      this.LOCAL_BASE_URL,
      { infer: true }
    );
  }

  public getTimeout(): number {
    return this.configSrv.get(
      ChildApiEnvKey.TIMEOUT,
      this.DEFAULT_TIMEOUT,
      { infer: true }
    );
  }

  public getConcurrency(): number {
    const childWorkers = this.configSrv.get(
      ChildApiEnvKey.WORKERS,
      this.DEFAULT_WORKERS,
      { infer: true }
    );
    const childConcurrency = this.configSrv.get(
      ChildApiEnvKey.CONCURRENCY,
      this.DEFAULT_CONCURRENCY,
      { infer: true }
    );

    return childWorkers * childConcurrency;
  }
}
