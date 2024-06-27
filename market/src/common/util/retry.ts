/**
 * 첫 시도 실패 후 이행과 관계없이 일정 간격마다 해결될 때까지 시도
 * - 최종 실패시 재시도과정의 에러는 무시하고 최종 에러로 reject.
 * - 재시도를 일으키지 않는 실패의 조건을 rejectCondition 에서 정의할 수 있음. true 반환하는 에러로 실패시 바로 reject.
 * - retryErrorHandler 를 통해 재시도시 에러를 처리할 수 있음.
 * 
 * @param interval ms
 * @param timeout ms
 */
export const intervalTryUntilResolvedOrTimeout = async <T>(
  task: () => Promise<T>,
  options: RetryOptions
): Promise<T> => new Promise<T>(async (resolve, reject) => {
  const {
    interval,
    timeout,
    rejectCondition,
    retryErrorHandler
  } = options;

  let
  solved = false,
  lastError: any;

  const callResolve = (res: T) => {
    solved = true;
    resolve(res);
  };

  const callReject = () => {
    solved = true;
    reject(lastError);
  };

  const resolveIfsolved = () => task()
  .then(res => solved || callResolve(res))
  .catch(e => {
    lastError = e;
    if (rejectCondition && rejectCondition(e)) {
      solved || callReject();
    } else {
      retryErrorHandler && retryErrorHandler(e);
    }
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

/**
 * 실패하면 일정 간격 후 재시도를 반복함.
 * - 최종 실패시 재시도과정의 에러는 무시하고 최종 에러로 reject.
 * - 재시도를 일으키지 않는 실패의 조건을 rejectCondition 에서 정의할 수 있음. true 반환하는 에러로 실패시 바로 reject.
 * - retryErrorHandler 를 통해 재시도시 에러를 처리할 수 있음.
 * 
 * @param interval ms
 * @param timeout ms
 */
export const retryUntilResolvedOrTimeout = <T>(
  task: () => Promise<T>,
  options: RetryOptions
): Promise<T> => new Promise<T>(async (resolve, reject) => {
  const {
    interval,
    timeout,
    rejectCondition,
    retryErrorHandler
  } = options;

  let
  solved = false,
  lastError: any,
  retryTimer: NodeJS.Timeout,
  endTimer: NodeJS.Timeout,
  mission = () => task()
  .then(res => {
    solved || (solved = true, resolve(res));
  })
  .catch(e => {
    if (rejectCondition && rejectCondition(e)) {
      solved || (solved = true, reject(e));
    } else {
      lastError = e;
      retryTimer = setTimeout(mission, interval);
      retryErrorHandler && retryErrorHandler(e);
    }
  })
  .finally(() => {
    if (solved) {
      retryTimer && clearTimeout(retryTimer);
      endTimer && clearTimeout(endTimer);
    }
  });

  await mission();
  if (solved) return;

  endTimer = setTimeout(() => {
    solved = true;
    clearTimeout(retryTimer)
    reject(lastError);
  }, timeout);
});

type RetryOptions = {
  interval: number;
  timeout: number;
  rejectCondition?: (err: any) => boolean;
  retryErrorHandler?: (err: any) => void;
};

export const isHttpResponse4XX = (err: any): boolean => {
  let statusCode: any;
  if (typeof (statusCode = err?.response?.status) === 'number') {} // axios
  else if (typeof (statusCode = err?.statusCode) === 'number') {}
  else return false;

  return statusCode.toString().startsWith('4');
};