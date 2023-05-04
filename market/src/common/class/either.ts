export abstract class Either<L, R> {

    constructor(private readonly eitherValue: L|R) {}
  
    static right = <L, R>(v: R): Either<L, R> => new EitherRight(v);
    static left = <L, R>(v: L): Either<L, R> => new EitherLeft(v);

    isRight() { return this instanceof EitherRight; }
    isLeft() { return this instanceof EitherLeft; }

    get getWhatever() {
        return this.eitherValue;}

    abstract get getRight(): R;
    abstract get getLeft(): L;

    flatMap<T, S>(fn: (v: R) => Either<T, S>): Either<L|T, S>; // right&right | left&_ | right&left
    flatMap<T, S>(fn: (v: R) => Promise<Either<T, S>>): Promise<Either<T, S>>; // right&right | right&left
    flatMap<T, S>(fn: (v: R) => Promise<Either<T, S>>): Either<L, S>; // left&_
    flatMap<T, S>(fn: (v: R) => Either<T, S> | Promise<Either<T, S>>): Either<L|T, S> | Promise<Either<T, S>> {
        return this.isRight() ? fn(this.getRight) : Either.left(this.getLeft);}

    map<S>(fn: (v: R) => S): Either<L, S> {
        return this.flatMap(v => Either.right(fn(v)));}
}

class EitherRight<R> extends Either<never, R> {

    get getRight() {
        return this.getWhatever;}

    get getLeft(): never {
        throw new Error(`Either getLeft Error. Either is Right, value: ${this.getWhatever}`);}
}

class EitherLeft<L> extends Either<L, never> {

    get getRight(): never {
        throw new Error(`Either getRight Error. Either is Left, value: ${this.getWhatever}`);}

    get getLeft() {
        return this.getWhatever;}
}
