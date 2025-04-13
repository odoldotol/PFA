import { wrapWithPromise } from "./";

export default abstract class Either<L, R> {

  constructor(
    private readonly eitherValue: L | R
  ) {}

  public static right<R, L = any>(v: R): Either<L, R> {
    return new EitherRight(v);
  }

  public static left<L, R = any>(v: L): Either<L, R> {
    return new EitherLeft(v);
  }

  public isRight(): boolean {
    return this instanceof EitherRight;
  }

  public isLeft(): boolean {
    return this instanceof EitherLeft;
  }

  protected get value(): L | R {
    return this.eitherValue;
  }

  public abstract get right(): R;

  public abstract get left(): L;

  public flatMap<S, T = any>(
    fn: (v: R) => Either<T, S>
  ): Either<L | T, S> {
    return this.isRight()
      ? fn(this.right)
      : Either.left(this.left);
  }

  public map<S>(
    fn: (v: R) => S
  ): Either<L, S> {
    return this.flatMap(v => Either.right(fn(v)));
  }

  public asyncFlatMap<S, T = any>(
    asyncFn: (v: R) => Promise<Either<T, S>>
  ): Promise<Either<L | T, S>> {
    return this.isRight()
      ? asyncFn(this.right)
      : wrapWithPromise(Either.left(this.left));
  }

  public asyncMap<S>(
    asyncFn: (v: R) => Promise<S>
  ): Promise<Either<L, S>> {
    return this.asyncFlatMap(async v => Either.right(await asyncFn(v)));
  }

}

class EitherRight<R> extends Either<never, R> {

  public get right(): R {
    return this.value;
  }

  public get left(): never {
    throw new Error(`Either left Error. Either is Right, value: ${this.value}`);
  }

}

class EitherLeft<L> extends Either<L, never> {

  public get right(): never {
    throw new Error(`Either right Error. Either is Left, value: ${this.value}`);
  }

  public get left(): L {
    return this.value;
  }

}

export const getRightArray = <R, L = any>(
  eitherArr: readonly Either<L, R>[]
): R[] => eitherArr
.filter(either => either.isRight())
.map(either => either.right);

export const getLeftArray = <R, L = any>(
  eitherArr: readonly Either<L, R>[]
): L[] => eitherArr
.filter(either => either.isLeft())
.map(either => either.left);

export const flatMap = <R, S, L = any, T = any>(
  fn: (v: R) => Either<T, S>
): ((either: Either<L, R>) => Either<L | T, S>) => {
  return either => either.flatMap(fn);
};

export const asyncFlatMap = <R, S, L = any, T = any>(
  asyncFn: (v: R) => Promise<Either<T, S>>
): ((either: Either<L, R>) => Promise<Either<L | T, S>>) => {
  return either => either.asyncFlatMap(asyncFn);
};

export const map = <R, S, L = any, T = any>(
  fn: (v: R) => S
): ((either: Either<L, R>) => Either<L | T, S>) => {
  return either => either.map(fn);
};

export const asyncMap = <R, S, L = any, T = any>(
  asyncFn: (v: R) => Promise<S>
): ((either: Either<L, R>) => Promise<Either<L | T, S>>) => {
  return either => either.asyncMap(asyncFn);
};

export const wrapPromise = <S, T = any>(
  promise: Promise<S>
): Promise<Either<T, S>> => promise
.then(Either.right<S, T>)
.catch(Either.left<T, S>);

export const wrapAsync = <S extends Awaited<ReturnType<F>>, T = any, F extends ((...args: any[]) => Promise<any>) = (() => Promise<S>)>(
  asyncFn: F
): ((...args: Parameters<F>) => Promise<Either<T, S>>) => {
  return (...args: Parameters<F>) => wrapPromise(asyncFn(...args));
};

export const wrap = <S extends ReturnType<F>, T = any, F extends ((...args: any[]) => any) = (() => S)>(
  fn: F
): ((...args: Parameters<F>) => Either<T, S>) => {
  return (...args: Parameters<F>) => {
    try {
      return Either.right<S, T>(fn(...args));
    } catch (e) {
      return Either.left<T, S>(e as T);
    }
  };
};

export const wrapFlatMap = <S, R, L = any, T = any>(
  fn: (v: R) => S
): ((either: Either<L, R>) => Either<L | T, S>) => {
  return flatMap<R, S, L, T>(wrap(fn));
};

export const wrapAsyncFlatMap = <S, R, L = any, T = any>(
  asyncFn: (v: R) => Promise<S>
): ((either: Either<L, R>) => Promise<Either<L | T, S>>) => {
  return asyncFlatMap<R, S, L, T>(wrapAsync(asyncFn));
};