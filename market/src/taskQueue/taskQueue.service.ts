import {
  Inject,
} from '@nestjs/common';
import { MODULE_OPTIONS_TOKEN } from './taskQueue.module-definition';
import { TaskQueueModuleOptions } from './interface';
import { Observable } from 'rxjs';

export class TaskQueueService {

  // Todo: 내장 Array 말고 Queue 를 구현해서 사용하기?
  private readonly taskQueue: TaskWrapper[] = [];
  private readonly consumerQueue: GetNextTaskWrapperResolver[] = [];

  constructor (
    @Inject(MODULE_OPTIONS_TOKEN) options: TaskQueueModuleOptions
  ) {
    const { concurrency } = options;

    if (!(1 <= concurrency)) {
      throw new Error('Concurrency must be at least 1');
    }

    // spawn consumers
    for (let i = 1; i <= concurrency; i++) {
      this.consumer();
    }
  }

  /**
   * 큐를 통과해 처리되는 데로 결과를 반환.
   * - Promise 는 이행될 때까지 기다리고 반환함.
   * - Observable 은 곧바로 이행되어 반환되지만 큐 내부에서 Observable 이 완료되는 것을 기다림.
   */
  public runTask<T>(task: PromiseTask<T>): Promise<T>;
  public runTask<T>(task: ObservableTask<T>): Promise<Observable<T>>;
  public runTask<T>(task: Task<T>): Promise<T | Observable<T>> {
    return new Promise((resolve, reject) => {
      const taskWrapper = this.wrapTask(task, resolve, reject);

      if (this.consumerQueue.length !== 0) {
        this.consumerQueue.shift()!(taskWrapper);
      } else {
        this.taskQueue.push(taskWrapper);
      }
    });
  }

  /**
   * - 비동기적 재귀함수.
   * - TaskWrapper 를 큐에서 꺼내 실행하고 기다림.
   */
  private consumer(): Promise<void> {
    return new Promise(resolve => {
      this.getNextTaskWrapper()
      .then(taskWrapper => {
        return taskWrapper()
      })
      .catch(_error => {}) // Task 에 대한 에러는 여기서는 무시하고 runTask 를 통해 던져져서 외부에서 처리한다.
      .finally(() => {
        this.consumer(); // 비동기적 재귀
        resolve(); // 주의: resolve(this.consumer()); 는 무한 재귀 프로미스 해결 체인의 메모리 누수 버그를 일으킴.
      });
    });
  }

  private getNextTaskWrapper(): Promise<TaskWrapper> {
    return new Promise(resolve => {
      if (this.taskQueue.length !== 0) {
        resolve(this.taskQueue.shift()!);
      } else {
        this.consumerQueue.push(resolve);
      }
    });
  }

  /**
   * 큐에서 실제로 처리하고 기다리는 TaskWrapper 를 반환.
   * - Promise 에는 리졸버랑 리젝터를 달아두고 이행될 때까지 기다림.
   * - Observable 은 곧바로 리졸버에 넘기고, Observable 이 완료되는 것을 기다림.
   */
  private wrapTask<T>(
    task: Task<T>,
    runTaskResolver: (value: T | Observable<T>) => void,
    runTaskRejecter: (error: any) => void
  ): TaskWrapper {
    return async () => {
      let taskReturn: ReturnType<Task<T>>;
      try {
        taskReturn = task();
      } catch (error) {
        runTaskRejecter(error);
        return;
      }

      if (taskReturn instanceof Promise) {
        await taskReturn.then(runTaskResolver, runTaskRejecter);
      } else if (taskReturn instanceof Observable) {
        runTaskResolver(taskReturn); // 일단 runTask 리졸버앤 넘기고 기다리기.
        await new Promise<void>((resolve, reject) => {
          (taskReturn as Observable<T>).subscribe({ // 타입단언 필요없지만, 테스트코드에서 유추 못하는 애러가 있음.
            complete: resolve,
            error: reject,
          });
        });
      } else { // never
        runTaskRejecter(new Error('Task must return a Promise or an Observable'));
      }
    };
  }
}

type Task<T> = PromiseTask<T> | ObservableTask<T>;
type PromiseTask<T> = () => Promise<T>;
type ObservableTask<T> = () => Observable<T>;

type TaskWrapper = () => Promise<void>;
type GetNextTaskWrapperResolver = (value: TaskWrapper) => void;