import { Inject, Injectable } from '@nestjs/common';
import { HttpService as NestHttpService } from '@nestjs/axios';
import { AxiosResponse, AxiosError, AxiosInstance } from 'axios';
import * as F from "@fxts/core";

@Injectable()
export class HttpService extends NestHttpService {

  constructor(
    @Inject('AXIOS_INSTANCE_TOKEN') axiosInstance: AxiosInstance,
  ) {
    super(axiosInstance);
  }

  /**
   * 첫 시도 후 응답시간과 관계없이 일정 간격마다 성공할때까지 시도
   * @todo 밖으로 꺼내는게 좋을듯?
   * @param interval ms
   * @param timeout ms
   */
  public async intervalTryUntilRespondOrTimeout<T, D>(
    interval: number,
    timeout: number,
    httpCb: () => Promise<AxiosResponse<T, D>>
  ): Promise<AxiosResponse<T, D>> {
    let solved = false;

    return new Promise<AxiosResponse<T, D>>(async (resolve, reject) => {
      let lastError: any;

      const callResolve = (res: AxiosResponse<T, D>) => {
        solved = true;
        resolve(res);
      };

      const callReject = () => {
        solved = true;
        reject(lastError);
      };

      const resolveIfsolved = () => httpCb()
      .then(res => solved || callResolve(res))
      .catch(e => {
        lastError = e;
        e instanceof AxiosError &&
        e.response?.status?.toString().startsWith('4') &&
        (solved || callReject());
      });

      await resolveIfsolved();
      if (solved) return;

      const resolverCallback = () => solved || resolveIfsolved().finally(() => solved && clearAll());
      const rejecterCallback = () => solved || (callReject(), clearAll());

      const resolver = setInterval(resolverCallback, interval);
      const rejecter = setTimeout(rejecterCallback, timeout);

      const clearAll = () => {
        clearInterval(resolver);
        clearTimeout(rejecter);
      };
    });
  }

  /**
   * 실패하면 일정 간격 후 재시도
   * @todo 밖으로 꺼내는게 좋을듯?
   * @param interval ms
   * @param timeout ms
   */
  public retryUntilRespondOrTimeout<T, D>(
    interval: number,
    timeout: number,
    httpCb: () => Promise<AxiosResponse<T, D>>
  ): Promise<AxiosResponse<T, D>> {
    return new Promise<AxiosResponse<T, any>>(async (resolve, reject) => {
      let solved = false;
      let lastError: any;
      let retryTimer: NodeJS.Timeout;
      let endTimer: NodeJS.Timeout;

      let mission
      : (() => Promise<void>) | null
      = () => httpCb()
      .then(res => {
        solved = true;
        resolve(res);
      })
      .catch(e => {
        if (
          e instanceof AxiosError &&
          e.response?.status?.toString().startsWith('4')
        ) {
          solved = true;
          endTimer && clearTimeout(endTimer);
          reject(e)
        } else {
          if (mission) {
            lastError = e;
            retryTimer = setTimeout(mission, interval);
            console.error({ // [dev] 재시도 로깅
              url: e.config.url,
              ...F.omit(["request", "config"], e)
            });
          }
        }
      });

      await mission();
      if (solved) return;

      endTimer = setTimeout(() => {
        clearTimeout(retryTimer)
        mission = null;
        solved = true;
        reject(lastError);
      }, timeout);
    })
  }
}
