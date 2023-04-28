export abstract class Either<L, R> {

    constructor(protected readonly eitherValue: L|R) {}
  
    static right = <L, R>(v: R): Either<L, R> => new EitherRight(v);
    static left = <L, R>(v: L): Either<L, R> => new EitherLeft(v);

    isRight = () => this instanceof EitherRight;
    isLeft = () => this instanceof EitherLeft;

    get getWhatever() {
        return this.eitherValue
    }

    abstract get getRight(): R|never;
    abstract get getLeft(): L|never;

    // flatMap = <T, S>(fn: (v: R) => Either<T, S>): Either<T|L, S> =>
    //     this.isRight() ? fn(this.getRight) : Either.left<L, S>(this.getLeft);

    // flatMapPromise = async <T, S>(fn: (v: R) => Promise<Either<T, S>>): Promise<Either<T|L, S>> =>
    //     this.isRight() ? await fn(this.getRight) : Either.left<L, S>(this.getLeft);
    
    // map = <S>(fn: (v: R) => S) =>
    //     this.flatMap<L, S>(v => Either.right(fn(v)));
}

export class EitherRight<R> extends Either<never, R> {
    
    constructor(v: R) { super(v); }

    get getRight() {
        return this.eitherValue;}

    get getLeft(): never {
        throw new Error(`Either getLeft Error. Either is Right, value: ${this.eitherValue}`);}
}

export class EitherLeft<L> extends Either<L, never> {

    constructor(v: L) { super(v); }

    get getRight(): never {
        throw new Error(`Either getRight Error. Either is Left, value: ${this.eitherValue}`);}

    get getLeft() {
        return this.eitherValue;}
}