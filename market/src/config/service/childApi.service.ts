import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  DEFAULT_CHILD_API_CONCURRENCY,
  DEFAULT_CHILD_API_THREADPOOL_WORKERS,
  DEFAULT_CHILD_API_TIMEOUT,
  DEFAULT_CHILD_API_WORKERS
} from "../const";
import { ChildApiEnvKey, PriceRequestStrategy } from "../enum";
import { ChildApiEnvironmentVariables } from "../interface";

@Injectable()
export class ChildApiConfigService {

  private readonly LOCAL_BASE_URL = 'http://127.0.0.1:8001';

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
      DEFAULT_CHILD_API_TIMEOUT,
      { infer: true }
    );
  }

  public getWorkers(): number {
    return this.configSrv.get(
      ChildApiEnvKey.WORKERS,
      DEFAULT_CHILD_API_WORKERS,
      { infer: true }
    );
  }

  /**
   * 기본값 multi
   */
  public getPriceRequestStrategy(): PriceRequestStrategy {
    const result = this.configSrv.get(
      ChildApiEnvKey.PRICE_REQUEST_STRATEGY,
      { infer: true }
    );
    return result === PriceRequestStrategy.SINGLE ? result : PriceRequestStrategy.MULTI;
  }

  public getConcurrency(): number {
    const childWorkers = this.getWorkers();
    const childConcurrency = this.configSrv.get(
      ChildApiEnvKey.CONCURRENCY,
      DEFAULT_CHILD_API_CONCURRENCY,
      { infer: true }
    );
    return childWorkers * childConcurrency;
  }

  public getChildThreadpoolWorkers(): number {
    return this.configSrv.get(
      ChildApiEnvKey.THREADPOOL_WORKERS,
      DEFAULT_CHILD_API_THREADPOOL_WORKERS,
      { infer: true }
    );
  }
}
