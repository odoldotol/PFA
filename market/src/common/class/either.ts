import { warpWithPromise } from "../util";

export default abstract class Either<L, R> {

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
      ? warpWithPromise(fn(this.right))
      : warpWithPromise(Either.left(this.left));
  }

  public map<S>(
    fn: (v: R) => S | Promise<S>
  ): Promise<Either<L, S>> {
    return this.flatMap(async v => Either.right(await fn(v)));
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

export const map = <L, R, T>(
  fn: (v: R) => T | Promise<T>
): ((either: Either<L, R>) => Promise<Either<L, T>>) => {
  return either => either.map(fn);
};

export const flatMap = <L, R, T, S>(
  fn: (v: R) => Either<T, S> | Promise<Either<T, S>>
): ((either: Either<L, R>) => Promise<Either<L | T, S>>) => {
  return either => either.flatMap(fn);
};

export const getRightArray = <L, R>(
  eitherArr: readonly Either<L, R>[]
): R[] => eitherArr
.filter(either => either.isRight())
.map(either => either.right);

export const getLeftArray = <L, R>(
  eitherArr: readonly Either<L, R>[]
): L[] => eitherArr
.filter(either => either.isLeft())
.map(either => either.left);

/**
 * ### Wrap settled promise with Either
 */
export const wrapPromise = <T, S = any>(
  promise: Promise<T>
): Promise<Either<S, T>> => promise
.then(Either.right<S, T>)
.catch(Either.left<S, T>);