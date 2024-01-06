import { Injectable } from '@nestjs/common';
import { HttpService } from 'src/http/http.service';
import { TaskQueueService } from 'src/taskQueue/taskQueue.service';
import { ChildError } from './interface';
import { firstValueFrom, map } from 'rxjs';
import Either from "src/common/class/either";

@Injectable()
export class ChildApiService {

  constructor(
    private readonly httpService: HttpService,
    private readonly taskQueue: TaskQueueService,
  ) {}

  // Todo: Refac <- 먼저 차일드서버에서 에러를 그냥 던지도록 리팩터링하자. 그리고 either 의 wrapPromise 로 감싸자.
  public post<T>(url: string): Promise<Either<ChildError, T>> {
    return this.taskQueue.runTask(() => firstValueFrom(this.httpService.post(url).pipe(
      map(res => res.data as T & {error?: ChildError}),
      map(data => data.error ? Either.left(data.error) : Either.right(data))
    )));
  }

}
