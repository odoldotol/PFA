export class Either<L, R> implements EitherI<L, R>{

    constructor(
        private readonly leftValue: L,
        private readonly rightValue: R,
    ) {
        this.leftValue === undefined && this.rightValue === undefined
        && (() => { throw new Error('Either must have a value') })();
    }
  
    static right = <R>(value: R): Either<undefined, R> => new this(undefined, value);
  
    static left = <L>(value: L): Either<L, undefined> => new this(value, undefined);

    get isRight() {
        return this.leftValue === undefined;
    }

    get isLeft() {
        return this.rightValue === undefined;
    }

    get getWhatever() {
        return this.isRight ? this.rightValue : this.leftValue;
    }

    getRightOrThrowCustomError(error: any) {
        if (this.isLeft) throw new error(this.leftValue);
        return this.rightValue;
    }

    get getRightOrThrowError() {
        if (this.isLeft) throw new Error(`Either GetRightOrThrowError. Either is Left: ${this.leftValue}`);
        return this.rightValue;
    }

    get getLeftOrThrowError() {
        if (this.isRight) throw new Error(`Either GetLeftOrThrowError. Either is Right: ${this.rightValue}`);
        return this.leftValue;
    }

    map = <S>(fn: (v: R) => S): Either<L, S> =>
        this.flatMap(v => Either.right(fn(v)));

    flatMap = <T, S>(fn: (v: R) => Either<S, T>): Either<S|L, T> =>
        this.isRight ? fn(this.rightValue) : Either.left(this.leftValue);

    flatMapPromise = async <T, S>(fn: (v: R) => Promise<Either<S, T>>): Promise<Either<S|L, T>> =>
        this.isRight ? await fn(this.rightValue) : Either.left(this.leftValue);
}