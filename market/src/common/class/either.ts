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

    /**
     * ### fn 이 AsyncFunction 이 아니고 Promise 를 반환하는 경우 left 가 이를 확인 할 방법이 없다는 심각한 오류가 있다.
     * ### 때문에 이 경우 Promise 를 반환하지 못하고 있음.
     */
    flatMap<T, S>(fn: (v: R) => Either<T, S>): Either<L|T, S>;
    flatMap<T, S>(fn: (v: R) => Promise<Either<T, S>>): Promise<Either<L|T, S>>; // Error: fn 이 AsyncFunction 이 아니고 Promise 를 반환하는 경우 left 가 Promise 가 아닌 EitherLeft 를 반환한다.
    flatMap<T, S>(fn: (v: R) => Either<T, S> | Promise<Either<T, S>>): Either<L|T, S> | Promise<Either<L|T, S>> {
        return this.isRight() ?
            fn(this.getRight)
            : (fn.constructor.name === 'AsyncFunction') ?
                Promise.resolve(Either.left(this.getLeft))
                : Either.left(this.getLeft);}
    
    // Todo: flatMap 을 호출하면서 isRight() | fn(this.getRight) 를 두번 계산하는 경우가 있는데 한번만 계산하도록 개선?
    map<S extends (arg: R) => Promise<any>>(fn: S): Promise<Either<L, Awaited<ReturnType<S>>>>; // Error: fn 이 AsyncFunction 이 아니고 Promise 를 반환하는 경우 left 가 Promise 가 아닌 EitherLeft 를 반환한다.
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
