import { Test } from "@nestjs/testing";
import { TaskQueueService } from "./taskQueue.service";
import { MODULE_OPTIONS_TOKEN } from "./taskQueue.module-definition";
import {
  Observable,
  lastValueFrom,
  Subject,
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

      it('<T>(task: () => Observable<T>): Promise<Observable<T>>', async () => {
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

      it('Observable', async () => {
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
        const subject = new Subject<number>();
        setTimeout(() => {
          testNum--;
          subject.next(concurrencyArr.pop()!);
          subject.complete();
        }, Math.random() * 100);
        return subject;
      };
    });
  });
});
