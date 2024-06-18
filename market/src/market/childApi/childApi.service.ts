import { Injectable } from '@nestjs/common';
import { HttpService } from 'src/http';
import { TaskQueueService } from 'src/taskQueue';
import { ChildError } from './interface';
import {
  // catchError,
  firstValueFrom,
  // map
} from 'rxjs';
import Either, * as E from "src/common/class/either";
import * as F from "@fxts/core";

@Injectable()
export class ChildApiService {

  constructor(
    private readonly httpService: HttpService,
    private readonly taskQueue: TaskQueueService,
  ) {}

  // Todo: 프로젝트 전체적으로 either 를 제거하기.
  // Todo: 옵저버블을 외부로 노출해야한다.
  public post<T>(
    url: string,
    options?: Options,
  ): Promise<Either<ChildError, T>> {
    const req = () => firstValueFrom(this.httpService.post<T>(
      url,
      options?.data
    ));

    const reqWithQueue = () => this.taskQueue.runTask(req);

    return E.wrapPromise(this.httpService.retryUntilRespondOrTimeout(
      options?.retryOptions?.interval || 500,
      options?.retryOptions?.timeout || 1000 * 5,
      reqWithQueue
    ).then(res => res.data)
    .catch(err => {
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
    }));
  }
}

type Options = {
  data?: any,
  retryOptions?: RetryOptions
};

type RetryOptions = {
  interval: number,
  timeout: number
};