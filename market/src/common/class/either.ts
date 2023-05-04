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

    flatMap<T, S>(fn: (v: R) => Either<T, S>): Either<L|T, S>;
    flatMap<T, S>(fn: (v: R) => Promise<Either<T, S>>): Promise<Either<T, S>>; // left 인 경우 사실 Either<L, S> 를 반환한다.
    flatMap<T, S>(fn: (v: R) => Either<T, S> | Promise<Either<T, S>>): Either<L|T, S> | Promise<Either<T, S>> {
        return this.isRight() ? fn(this.getRight) : Either.left(this.getLeft);}
    
    // Todo: flatMap 을 호출하면서 isRight() | fn(this.getRight) 를 두번 계산하는 경우가 있는데 한번만 계산하도록 개선?
    map<S extends (arg: R) => Promise<any>>(fn: S): Promise<Either<L, Awaited<ReturnType<S>>>>; // left 인 경우 사실 Either<L, Awaited<ReturnType<S>>> 를 반환한다.
    map<S>(fn: (v: R) => S): Either<L, S>;
    map<S>(fn: (v: R) => S): Either<L, S> | Promise<Either<L, Awaited<S>>> {
        if (fn.constructor.name === 'AsyncFunction' || (this.isRight() && fn(this.getRight) instanceof Promise))
            return this.flatMap(async v => Either.right(await fn(v)));
        else return this.flatMap(v => Either.right(fn(v)));}
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
