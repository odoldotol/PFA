import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { AxiosResponse } from 'axios';
import {
  InjectTaskQueue,
  TaskQueueService
} from 'src/taskQueue';
import {
  CHILD_WORKERS_QUEUE
} from './const';
import { Observable } from 'rxjs';
import * as X from 'rxjs';
import * as F from "@fxts/core";

@Injectable()
export class ChildApiService {

  private readonly logger = new Logger(ChildApiService.name);

  constructor(
    private readonly concurrencyQueueSrv: TaskQueueService,
    @InjectTaskQueue(CHILD_WORKERS_QUEUE)
    private readonly workersQueueSrv: TaskQueueService
  ) {
    this.logger.verbose("ConcurrencyQueue Concurrency: " + `${concurrencyQueueSrv.getConcurrency()}`);
    this.logger.verbose("WorkersQueue Concurrency: " + `${workersQueueSrv.getConcurrency()}`);
  }

  public async withConcurrencyQueue<T>(
    axiosRequest: () => Observable<AxiosResponse<T, any>>
  ): Promise<Observable<T>> {
    return this.axiosPipe(await this.concurrencyQueueSrv.runTask(axiosRequest));
  }

  public async withWorkersQueue<T>(
    axiosRequest: () => Observable<AxiosResponse<T, any>>
  ): Promise<Observable<T>> {
    return this.axiosPipe(await this.workersQueueSrv.runTask(axiosRequest));
  }

  public pauseConcurrencyQueue() {
    return this.concurrencyQueueSrv.pause();
  }

  /**
   * Axios 응답 Observable 에 차일드 API 에 알맞는 일차적 파이프 처리.
   * 
   * - Axios 응답에서 data 를 꺼냄
   * - 에러를 ChildError 로 변환.
   */
  private axiosPipe<T>(
    axiosObservable: Observable<AxiosResponse<T, any>>
  ): Observable<T> {
    return axiosObservable.pipe(
      X.catchError(err => {
        if (err.response === undefined) {
          throw {
            statusCode: 500,
            ...F.omit(["request", "config"], err), // 필요없는것 제거(특히, 몽고에 업데이트 결과 로깅하는데 bson 전환 이슈떄문에 제거함)
          };
        } else {
          throw {
            statusCode: err.response.status,
            ...err.response.data,
          };
        }
      }),
      X.map(res => res.data)
    );
  }
}
