export abstract class Either<L, R> {
  
    static right = <L, R>(v: R): Either<L, R> => new EitherRight(v);
    static left = <L, R>(v: L): Either<L, R> => new EitherLeft(v);

    // isRight = () => this.getLeft === undefined;
    // isLeft = () => this.getRight === undefined;

    // get getWhatever() {
    //     return this.isRight() ? this.getRight : this.getLeft;}

    // get getRight() {
    //     if (this.isLeft()) throw new Error(`Either getRightError. Either is Left: ${this.getLeft}`);
    //     return this.rightValue;}

    // get getLeft() {
    //     if (this.isRight()) throw new Error(`Either getLeftError. Either is Right: ${this.getRight}`);
    //     return this.leftValue;}

    // flatMap = <T, S>(fn: (v: R) => Either<T, S>): Either<T|L, S> =>
    //     this.isRight() ? fn(this.getRight) : Either.left<L, S>(this.getLeft);

    // flatMapPromise = async <T, S>(fn: (v: R) => Promise<Either<T, S>>): Promise<Either<T|L, S>> =>
    //     this.isRight() ? await fn(this.getRight) : Either.left<L, S>(this.getLeft);
    
    // map = <S>(fn: (v: R) => S) =>
    //     this.flatMap<L, S>(v => Either.right(fn(v)));
}

export class EitherRight<R> extends Either<never, R> {
    constructor(private readonly rightValue: R) {
        super();
    }
}

export class EitherLeft<L> extends Either<L, never> {
    constructor(private readonly leftValue: L) {
        super();
    }
}