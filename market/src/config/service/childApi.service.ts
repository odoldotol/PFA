import {
  Injectable,
  Logger
} from "@nestjs/common";
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

  private readonly logger = new Logger(ChildApiConfigService.name);

  private readonly LOCAL_BASE_URL = 'http://127.0.0.1:8001';
  private readonly PRICE_REQUEST_STRATEGY: PriceRequestStrategy;

  constructor(
    private readonly configSrv: ConfigService<ChildApiEnvironmentVariables>,
  ) {
    this.PRICE_REQUEST_STRATEGY = this.getPriceRequestStrategy();
  }

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

  public isPriceRequestStrategySingle(): boolean {
    return this.PRICE_REQUEST_STRATEGY === PriceRequestStrategy.SINGLE;
  }

  public isPriceRequestStrategyMulti(): boolean {
    return this.PRICE_REQUEST_STRATEGY === PriceRequestStrategy.MULTI;
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

  /**
   * 기본값 multi
   */
  private getPriceRequestStrategy(): PriceRequestStrategy {
    let result = this.configSrv.get(
      ChildApiEnvKey.PRICE_REQUEST_STRATEGY,
      { infer: true }
    );

    switch (result) {
      case PriceRequestStrategy.SINGLE:
        break;
      case PriceRequestStrategy.MULTI:
        break;
      default:
        result = PriceRequestStrategy.MULTI;
        this.logger.verbose("PRICE_REQUEST_STRATEGY : Use default value 'multi'");
    }
    return result;
  }
}
