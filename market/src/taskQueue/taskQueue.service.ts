import { Inject } from '@nestjs/common';
import { MODULE_OPTIONS_TOKEN } from './taskQueue.module-definition';
import { TaskQueue, Task } from 'src/common/interface';
import { TaskQueueModuleOptions } from './interface';

export class TaskQueueService<T = any> 
  implements TaskQueue<T>
{
  // Todo: 내장 Array 말고 Queue 를 구현해서 사용하기.
  private readonly taskQueue: Task<T>[] = [];

  // Todo: 내장 Array 말고 Queue 를 구현해서 사용하기.
  private readonly consumerQueue
  : ((value: Task<T>) => void)[]
  = [];

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

  public runTask(task: Task<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const taskWrapper: Task<T> = () => {
        const taskPromise = task();
        taskPromise.then(resolve, reject);
        return taskPromise;
      };

      if (this.consumerQueue.length !== 0) {
        // there is a sleeping consumer available, use it to run our task
        const consumer = this.consumerQueue.shift()!;
        consumer(taskWrapper);
      } else {
        // all consumers are busy, enqueue the task
        this.taskQueue.push(taskWrapper);
      }
    });
  }

  // 비동기적인 재귀 (재귀적 프로미스 해결의 메모리 누수 버그 주의)
  private consumer() {
    return new Promise<void>(resolve => {
      this.getNextTask()
      .then(task => task())
      .catch(err => console.error(err)) // Todo: 에러 처리
      .finally(() => {
        this.consumer();
        resolve(); // resolve(this.consumer()) 는 무한 재귀 프로미스 해결 체인의 메모리 누수 버그를 일으킴.
      });
    });
  }

  private getNextTask() {
    return new Promise<Task<T>>((resolve) => {
      if (this.taskQueue.length !== 0) {
        return resolve(this.taskQueue.shift()!);
      }

      this.consumerQueue.push(resolve);
    });
  }

}
