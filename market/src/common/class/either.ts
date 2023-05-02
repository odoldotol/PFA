export abstract class Either<L, R> {

    constructor(private readonly eitherValue: L|R) {}
  
    static right = <L, R>(v: R): Either<L, R> => new EitherRight(v);
    static left = <L, R>(v: L): Either<L, R> => new EitherLeft(v);

    isRight = () => this instanceof EitherRight;
    isLeft = () => this instanceof EitherLeft;

    get getWhatever() {
        return this.eitherValue;}

    abstract get getRight(): R;
    abstract get getLeft(): L;

    abstract flatMap<T, S>(fn: (v: R) => Either<T, S>): Either<L|T, S>;
    abstract flatMapPromise<T, S>(fn: (v: R) => Promise<Either<T, S>>): Promise<Either<L|T, S>>;

    map = <S>(fn: (v: R) => S): Either<L, S> =>
        this.flatMap(v => Either.right(fn(v)));
}

class EitherRight<R> extends Either<never, R> {

    get getRight() {
        return this.getWhatever;}

    get getLeft(): never {
        throw new Error(`Either getLeft Error. Either is Right, value: ${this.getWhatever}`);}

    flatMap = <T, S>(fn: (v: R) => Either<T, S>) =>
        fn(this.getWhatever);
    
    flatMapPromise = <T, S>(fn: (v: R) => Promise<Either<T, S>>) =>
        fn(this.getWhatever);
}

class EitherLeft<L> extends Either<L, never> {

    get getRight(): never {
        throw new Error(`Either getRight Error. Either is Left, value: ${this.getWhatever}`);}

    get getLeft() {
        return this.getWhatever;}
    
    flatMap = <T, S>(_fn: (v: never) => Either<T, S>) =>
        Either.left<L, S>(this.getWhatever);
    
    flatMapPromise = async <T, S>(_fn: (v: never) => Promise<Either<T, S>>) =>
        Either.left<L, S>(this.getWhatever);
}
