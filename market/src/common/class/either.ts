export abstract class Either<L, R> implements EitherI<L, R> {

    constructor(private readonly eitherValue: L|R) {}
  
    static right = <L, R>(v: R): Either<L, R> => new EitherRight(v);
    static left = <L, R>(v: L): Either<L, R> => new EitherLeft(v);

    isRight = () => this instanceof EitherRight;
    isLeft = () => this instanceof EitherLeft;

    get getWhatever() {
        return this.eitherValue;}

    abstract get getRight(): R;
    abstract get getLeft(): L;

    abstract flatMap<T, S>(fn: (v: R) => EitherI<T, S>): Either<L|T, S>;
    abstract flatMapPromise<T, S>(fn: (v: R) => Promise<EitherI<T, S>>): Promise<Either<L|T, S>>;
    abstract map<S>(fn: (v: R) => S): Either<L, S>;
}

class EitherRight<R> extends Either<never, R> {
    
    constructor(v: R) { super(v); }

    get getRight() {
        return this.getWhatever;}

    get getLeft(): never {
        throw new Error(`Either getLeft Error. Either is Right, value: ${this.getWhatever}`);}

    flatMap = <T, S>(fn: (v: R) => Either<T, S>) => fn(this.getWhatever);
    flatMapPromise = async <T, S>(fn: (v: R) => Promise<Either<T, S>>) => await fn(this.getWhatever);
    map = <S>(fn: (v: R) => S) => Either.right<never, S>(fn(this.getWhatever));
}

class EitherLeft<L> extends Either<L, never> {

    constructor(v: L) { super(v); }

    get getRight(): never {
        throw new Error(`Either getRight Error. Either is Left, value: ${this.getWhatever}`);}

    get getLeft() {
        return this.getWhatever;}
    
    flatMap = <T, S>(fn: (v: never) => Either<T, S>) => Either.left<L, S>(this.getWhatever);
    flatMapPromise = async <T, S>(fn: (v: never) => Promise<Either<T, S>>) => Either.left<L, S>(this.getWhatever);
    map = <S>(fn: (v: never) => S) => Either.left<L, never>(this.getWhatever);
}