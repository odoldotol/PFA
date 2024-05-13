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

@Injectable()
export class ChildApiService {

  constructor(
    private readonly httpService: HttpService,
    private readonly taskQueue: TaskQueueService,
  ) {}

  // Todo: Refac <- 먼저 차일드서버에서 에러를 그냥 던지도록 리팩터링하자. 그리고 either 의 wrapPromise 로 감싸자.
  public post<T>(
    url: string,
    data?: any
  ): Promise<Either<ChildError, T>> {
    return this.taskQueue.runTask(() => E.wrapPromise(firstValueFrom(this.httpService.post<T>(
      url,
      data
    ).pipe(
      catchError(err => {
        throw {
          statusCode: err.response.status,
          ...err.response.data,
        };
      }),
      map(res => res.data)
    ))));
  }
}
