import {
  Inject,
  Logger,
} from '@nestjs/common';
import { MODULE_OPTIONS_TOKEN } from './taskQueue.module-definition';
import { TaskQueueModuleOptions } from './interface';
import {
  Observable,
  Subject
} from 'rxjs';

export class TaskQueueService {

  private readonly logger = new Logger(TaskQueueService.name);

  // Todo: 내장 Array 말고 Queue 를 구현해서 사용하기?
  private readonly taskQueue: TaskWrapper[] = [];
  private readonly consumerQueue: GetNextTaskWrapperResolver[] = [];
  
  private readonly consumerSet = new Set<ConsumerWrapper>();
  private readonly pausedSet = new Set<Promise<void>>();

  constructor (
    @Inject(MODULE_OPTIONS_TOKEN)
    private readonly options: TaskQueueModuleOptions
  ) {
    this.start();
  }

  /**
   * 살아있는 consumer 의 수 반환.
   */
  public getConcurrency(): number {
    return this.consumerSet.size;
  }

  public countQueueingTasks(): number {
    return this.taskQueue.length;
  }

  public countQueuingConsumers(): number {
    return this.consumerQueue.length;
  }

  /**
   * Task 를 처리중인 consumer 의 수 반환.
   */
  public countWorkingConsumers(): number {
    return this.getConcurrency() - this.countQueuingConsumers();
  }

  /**
   * 큐를 통과해 처리되는 데로 결과를 반환.
   * - Promise 는 이행될 때까지 기다리고 반환함.
   * - Observable 은 최대한 빠르게 이행되어 반환되지만 큐 내부에서 Observable 이 완료되는 것을 기다림.
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
   * #### 큐를 일시정지시키고, 큐를 재개시킬 함수를 반환.
   * pause 는 독립적으로 동작하며 각각이 독립적으로 큐를 일시정지시키며, 각각에 대한 재개함수인 resume 을 반환함.
   * 즉, 모든 pause 에 대한 resume 이 실행되어야 큐가 재개되며, pause 가 하나라도 살아있으면 큐는 동작하지 않음.
   */
  public pause(): Resume {
    const pausedSubject = new Subject<void>();
    const paused = new Promise<void>(r => pausedSubject.subscribe({ complete: r }));
    this.pausedSet.add(paused);

    return () => {
      this.pausedSet.delete(paused);
      pausedSubject.complete();
    };
  }

  /**
   * [Dev]
   * 컨슈머가 현재 하던일을 마치는데로 종료되어 결국 모든 컨슈머를 종료시킴.
   */
  public stop(): void {
    this.consumerSet.clear(); // 컨슈머들 모두가 현재 하던일을 마치는데로 종료.
    while (this.consumerQueue.length !== 0) { // 대기중인 컨슈머를 모두 종료시키기 위해 더미 TaskWrapper 를 전달.
      this.consumerQueue.pop()!(() => Promise.resolve());
    }
  }

  /**
   * [Dev]
   * 컨슈머를 생성.
   */
  public start(concurrency = this.options.concurrency): void {
    if (this.isRunning()) {
      this.logger.warn('Queue is already running.');
    } else {
      if (concurrency < 1) {
        throw new Error('Concurrency must be at least 1');
      }
  
      for (let i = 1; i <= concurrency; i++) {
        this.spawnConsumer();
      }
    }
  }

  private spawnConsumer(): void {
    const consumerWrapper: ConsumerWrapper = {};
    consumerWrapper.consumer = this.consumer(consumerWrapper);
    this.consumerSet.add(consumerWrapper);
  }

  private async consumer(wrapper: ConsumerWrapper): Promise<void> {
    do {
      while (this.pausedSet.size !== 0) { // paused
        await Promise.all(this.pausedSet);
        if (!this.consumerSet.has(wrapper)) {
          return;
        }
      }

      try {
        const taskWrapper = await this.getNextTaskWrapper();
        await taskWrapper();
      } catch (error) {
        this.logger.warn(error); //
      }
    } while (this.consumerSet.has(wrapper));
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
   * TaskWrapper 는 Task 의 결과인 Promise 나 Observable 를 처리하고 기다림.
   * 
   * - Promise 에는 runTaskResolver 와 runTaskRejecter 을 달아두고 이를 기다림.
   * 
   * - Observable 은 옵저버역할을 할 Subject 에 의해 구독되며 Subject 가 최대한 빠르게 runTaskResolver 에 넘겨짐.
   * - 동기적인 Observable 을 처리할 수 있도록 Observable 에 대한 구독은 setImmediate 을 통해 충분히 미뤄짐. (Promise.resolve().then 으로 처리하여도 충분할 수 있음)
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
        const observerSubject = new Subject<T>();
        runTaskResolver(observerSubject); // 일단 runTask 리졸버에 옵저버를 넘기고 기다리기.

        // 옵저버 Observable 의 완료, 즉 이 Task 의 완료를 기다릴 Done Promise.
        const done = new Promise<void>(resolve => {
          observerSubject.subscribe({
            complete: resolve,
            error: resolve,
          });
        });

        // 동기 Observable 도 처리할 수 있도록,
        // setImmediate 에 넘겨서 microTaskQueue 의 모든 해결된 Promise 처리 이후에 충분히 미룬 후 처리하도록. (Promise.resolve().then 으로 처리하여도 충분할 수 있음)
        // taskReturn 이 동기적인 Observable 이라도 외부애서 observerSubject 로 구독할 수 있어짐.
        setImmediate(() => (taskReturn as Observable<T>).subscribe(observerSubject)); // 타입 단언 없으면 jest 가 타입 유추를 못함, 해결하고 타입단언 지우기.
        await done;
      } else { // never
        runTaskRejecter(new Error('Task must return a Promise or an Observable'));
      }
    };
  }

  private isRunning(): boolean {
    return this.consumerSet.size !== 0;
  }
}

type Task<T> = PromiseTask<T> | ObservableTask<T>;
type PromiseTask<T> = () => Promise<T>;
type ObservableTask<T> = () => Observable<T>;

type TaskWrapper = () => Promise<void>;
type GetNextTaskWrapperResolver = (value: TaskWrapper) => void;

type ConsumerWrapper = {
  consumer?: Promise<void>;
  state?: ConsumerState;
};
enum ConsumerState {
  PAUSED,
  QUEUEING,
  WORKING,
};

type Resume = () => void;