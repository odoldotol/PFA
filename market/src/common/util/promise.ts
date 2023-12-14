export const warpWithPromise = <T>(arg: T): Promise<Awaited<T>> =>
arg instanceof Promise ? arg : Promise.resolve(arg);