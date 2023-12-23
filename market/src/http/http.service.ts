import { Inject, Injectable } from '@nestjs/common';
import { HttpService as NestHttpService } from '@nestjs/axios';
import { AxiosResponse, AxiosError, AxiosInstance } from 'axios';

@Injectable()
export class HttpService extends NestHttpService {

  constructor(
    @Inject('AXIOS_INSTANCE_TOKEN') axiosInstance: AxiosInstance,
  ) {
    super(axiosInstance);
  }

  /**
   * @param interval ms
   * @param timeout ms
   */
  public async tryUntilResolved<T, D>(
    interval: number,
    timeout: number,
    httpCb: () => Promise<AxiosResponse<T, D>>
  ) {
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

}
