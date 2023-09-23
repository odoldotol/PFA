export abstract class Either<L, R> {

  constructor(private readonly eitherValue: L | R) {}

  static right = <L, R>(v: R): Either<L, R> => new EitherRight(v);
  static left = <L, R>(v: L): Either<L, R> => new EitherLeft(v);

  isRight() { return this instanceof EitherRight; }
  isLeft() { return this instanceof EitherLeft; }

  get getWhatever() { return this.eitherValue; }

  abstract get getRight(): R;
  abstract get getLeft(): L;

  flatMap<T, S>(fn: (v: R) => Either<T, S> | Promise<Either<T, S>>): Promise<Either<L | T, S>> {
    return this.isRight() ? this.toPromise(fn(this.getRight)) : this.toPromise(Either.left(this.getLeft));
  }

  map<S>(fn: (v: R) => S): Promise<Either<L, Awaited<S>>> {
    return this.flatMap(async v => Either.right(await fn(v)));
  }

  private toPromise<T>(r: T) { return r instanceof Promise ? r : Promise.resolve(r); }

  static getRightArray<L, R>(arr: Either<L, R>[]): R[] {
    return arr.filter(v => v.isRight()).map(v => v.getRight);
  }

  static getLeftArray<L, R>(arr: Either<L, R>[]): L[] {
    return arr.filter(v => v.isLeft()).map(v => v.getLeft);
  }
}

class EitherRight<R> extends Either<never, R> {

  get getRight() { return this.getWhatever; }

  get getLeft(): never {
    throw new Error(`Either getLeft Error. Either is Right, value: ${this.getWhatever}`);
  }
}

class EitherLeft<L> extends Either<L, never> {

  get getRight(): never {
    throw new Error(`Either getRight Error. Either is Left, value: ${this.getWhatever}`);
  }

  get getLeft() { return this.getWhatever; }
}
