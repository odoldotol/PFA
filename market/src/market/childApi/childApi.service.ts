import { Injectable } from '@nestjs/common';
import { HttpService } from 'src/http';
import { TaskQueueService } from 'src/taskQueue';
import { ChildError } from './interface';
import {
  catchError,
  firstValueFrom,
  map
} from 'rxjs';
import Either, * as E from "src/common/class/either";
import * as F from "@fxts/core";

@Injectable()
export class ChildApiService {

  constructor(
    private readonly httpService: HttpService,
    private readonly taskQueue: TaskQueueService,
  ) {}

  // Todo: Refac <- 먼저 차일드서버에서 에러를 그냥 던지도록 리팩터링하자. 그리고 either 의 wrapPromise 로 감싸자.
  // Todo: 프로젝트 전체적으로 either 를 제거하기.
  public post<T>(
    url: string,
    data?: any
  ): Promise<Either<ChildError, T>> {
    return this.taskQueue.runTask(() => E.wrapPromise(firstValueFrom(this.httpService.post<T>(
      url,
      data
    ).pipe(
      catchError(err => {
        if (err.response === undefined) {
          throw {
            statusCode: 500,
            ...F.omit(["request", "config"], err), // 필요없음(특히, 몽고에 업데이트 결과 로깅하는데 bson 전환 이슈떄문에 제거함)
          };
        } else {
          throw {
            statusCode: err.response.status,
            ...err.response.data,
          };
        }
      }),
      map(res => res.data)
    ))));
  }
}
