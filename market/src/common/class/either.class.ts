export class Either<L, R> {

    constructor(
        private readonly leftValue: L,
        private readonly rightValue: R
    ) {
        if ((this.leftValue === undefined && this.rightValue === undefined) ||
        (this.leftValue !== undefined && this.rightValue !== undefined))
        throw new Error('Either must have a value');
    }
  
    // static right = <L, R>(value: R): Either<L, R> => new this(undefined, value) as Either<L, R>;
    // static left = <L, R>(value: L): Either<L, R> => new this(value, undefined) as Either<L, R>;

    isRight = () => this.getLeft === undefined;
    isLeft = () => this.getRight === undefined;

    get getWhatever() {
        return this.isRight() ? this.getRight : this.getLeft;}

    get getRight() {
        if (this.isLeft()) throw new Error(`Either getRightError. Either is Left: ${this.getLeft}`);
        return this.rightValue;}

    get getLeft() {
        if (this.isRight()) throw new Error(`Either getLeftError. Either is Right: ${this.getRight}`);
        return this.leftValue;}

    // flatMap = <T, S>(fn: (v: R) => Either<T, S>): Either<T|L, S> =>
    //     this.isRight() ? fn(this.getRight) : Either.left<L, S>(this.getLeft);

    // flatMapPromise = async <T, S>(fn: (v: R) => Promise<Either<T, S>>): Promise<Either<T|L, S>> =>
    //     this.isRight() ? await fn(this.getRight) : Either.left<L, S>(this.getLeft);
    
    // map = <S>(fn: (v: R) => S) =>
    //     this.flatMap<L, S>(v => Either.right(fn(v)));
}

export class EitherRight<R> extends Either<never, R> {}

export class EitherLeft<L> extends Either<L, never> {}