import { Test } from "@nestjs/testing";
import { TaskQueueService } from "./taskQueue.service";
import { MODULE_OPTIONS_TOKEN } from "./taskQueue.module-definition";
import {
  Observable,
  lastValueFrom,
} from "rxjs";

const TEST_CONCURRENCY = 5;

describe('TaskQueueService', () => {
  let taskQueueService: TaskQueueService;

  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      providers: [
        TaskQueueService,
        { provide: MODULE_OPTIONS_TOKEN, useValue: { concurrency: TEST_CONCURRENCY } },
      ],
    }).compile();

    taskQueueService = testingModule.get(TaskQueueService);
  });

  it('should be defined', () => {
    expect(taskQueueService).toBeDefined();
  });

  describe('runTask', () => {
    describe('polymorphism', () => {
      it('<T>(task: () => Promise<T>) => Promise<T>', async () => {
        const task = () => Promise.resolve(1);
        const result = await taskQueueService.runTask(task);
        expect(result).toBe(1);
      });

      it('<T>(task: () => Observable<T>): Promise<Observable<T>> (동기 옵저버블 테스트를 겸함)', async () => {
        const task = () => new Observable(subscriber => {
          subscriber.next(1);
          subscriber.complete();
        });
        const result = await taskQueueService.runTask(task);
        expect(result).toBeInstanceOf(Observable);
        expect(await lastValueFrom(result)).toBe(1);
      });
    });

    describe('should run tasks concurrently up to the specified concurrency', () => {
      let concurrencyArr: number[];
      let testNum: number;

      beforeEach(() => {
        testNum = 0;
        concurrencyArr = [];
      });

      it('Promise', async () => {
        const TestTaskNum = TEST_CONCURRENCY * (Math.floor(Math.random() * 10) + 2);
        const result: number[] = [];
        await Promise.all(new Array(TestTaskNum)
          .fill(null)
          .map(_ => taskQueueService.runTask(concurrencyTestPromise)
            .then(res => result.push(res))
          )
        );
        result.forEach((num, idx) => {
          if (idx <= TestTaskNum - TEST_CONCURRENCY) {
            expect(num).toBeLessThanOrEqual(TEST_CONCURRENCY);
          } else {
            expect(num).toBe(TestTaskNum - idx);
          }
        });
      });

      it('Observable (비동기)', async () => {
        const TestTaskNum = TEST_CONCURRENCY * (Math.floor(Math.random() * 10) + 2);
        const result: number[] = [];
        await Promise.all(new Array(TestTaskNum)
          .fill(null)
          .map(_ => taskQueueService.runTask(concurrencyTestObservable)
            .then(res => lastValueFrom(res).then(val => result.push(val)))
          )
        );
        result.forEach((num, idx) => {
          if (idx <= TestTaskNum - TEST_CONCURRENCY) {
            expect(num).toBeLessThanOrEqual(TEST_CONCURRENCY);
          } else {
            expect(num).toBe(TestTaskNum - idx);
          }
        });
      });

      const concurrencyTestPromise = async (): Promise<number> => {
        concurrencyArr.push(++testNum);
        expect(concurrencyArr.length).toBe(testNum);
        expect(concurrencyArr.length).toBeLessThanOrEqual(TEST_CONCURRENCY);
        await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
        testNum--;
        return concurrencyArr.pop()!;
      };

      const concurrencyTestObservable = (): Observable<number> => {
        concurrencyArr.push(++testNum);
        expect(concurrencyArr.length).toBe(testNum);
        expect(concurrencyArr.length).toBeLessThanOrEqual(TEST_CONCURRENCY);
        return new Observable(subscriber => {
          setTimeout(() => {
            testNum--;
            subscriber.next(concurrencyArr.pop()!);
            subscriber.complete();
          }, Math.random() * 100);
        });
      };
    });
  });

  describe('pauseable', () => {
    describe('pause', () => {
      let resume: () => void;
      let done = 0

      const maxTaskDuration = 100;

      const pauseTestTask = () => new Promise<number>(resolve => {
        setTimeout(() => resolve(++done), Math.random() * maxTaskDuration);
      });

      const pauseTestNum = TEST_CONCURRENCY * 3;
      const pauseNum = TEST_CONCURRENCY * 2;

      it('should pause the task queue', async () => {

        for (let i = 0; i < pauseTestNum; i++) {
          taskQueueService.runTask(async () => {
            if (i === pauseNum - 1) {
              resume = await taskQueueService.pause();
            }
            return pauseTestTask();
          });
        }

        await new Promise(resolve => setTimeout(resolve, maxTaskDuration * pauseTestNum / TEST_CONCURRENCY));
        expect(done).toBe(pauseNum);
      });

      it('should return a resume function that resumes the task queue', async () => {
        resume();
        await new Promise(resolve => setTimeout(resolve, maxTaskDuration * (pauseTestNum - pauseNum) / TEST_CONCURRENCY));
        expect(done).toBe(pauseTestNum);
      });
    });
  })
});
