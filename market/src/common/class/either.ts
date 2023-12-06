import { promiseWarp } from "../util";

export abstract class Either<L, R> {

  constructor(
    private readonly eitherValue: L | R
  ) {}

  public static right<L, R>(v: R): Either<L, R> {
    return new EitherRight(v);
  }

  public static left<L, R>(v: L): Either<L, R> {
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

  public flatMap<T, S>(
    fn: (v: R) => Either<T, S> | Promise<Either<T, S>>
  ): Promise<Either<L | T, S>> {
    return this.isRight()
      ? promiseWarp(fn(this.right))
      : promiseWarp(Either.left(this.left));
  }

  public map<S>(
    fn: (v: R) => S | Promise<S>
  ): Promise<Either<L, S>> {
    return this.flatMap(async v => Either.right(await fn(v)));
  }

  public static getRightArray<L, R>(
    arr: readonly Either<L, R>[]
  ): R[] {
    return arr
    .filter(v => v.isRight())
    .map(v => v.right);
  }

  public static getLeftArray<L, R>(
    arr: readonly Either<L, R>[]
  ): L[] {
    return arr
    .filter(v => v.isLeft())
    .map(v => v.left);
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

export const eitherMap = <L, R, T>(
  fn: (v: R) => T | Promise<T>
): ((either: Either<L, R>) => Promise<Either<L, T>>) => {
  return either => either.map(fn);
};

export const eitherFlatMap = <L, R, T, S>(
  fn: (v: R) => Either<T, S> | Promise<Either<T, S>>
): ((either: Either<L, R>) => Promise<Either<L | T, S>>) => {
  return either => either.flatMap(fn);
};

/**
 * ### Wrap settled promise with Either
 */
export const eitherWrap = <T, S = any>(
  promise: Promise<T>
): Promise<Either<S, T>> => promise
.then(Either.right<S, T>)
.catch(Either.left<S, T>);