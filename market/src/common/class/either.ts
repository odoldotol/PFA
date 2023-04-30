export abstract class Either<L, R> {

    constructor(private readonly eitherValue: L|R) {}
  
    /*
     * Either.right, Either.left 으로 Either 를 생성하도록 하고싶어서 이렇게 구현하지만
     * 하위클래스에서도 right, left 를 사용할 수 있는것이 마음에 들지 않지만 export 하지 않는걸로 만족하자.
     */
    static right = <L, R>(v: R): Either<L, R> => new EitherRight(v);
    static left = <L, R>(v: L): Either<L, R> => new EitherLeft(v);

    isRight = () => this instanceof EitherRight;
    isLeft = () => this instanceof EitherLeft;

    get getWhatever() {
        return this.eitherValue
    }

    /*
     * 아래 4개의 추상매서드를 여기 상위클래스인 Either에서 정의할 수도 있으나,
     * Right 인지 Left 인지에 따라서 달라지는 아래 매서드들의 특성상
     * 각 하위클래스에서 정의하고있는 지금 상태가 꽤나 직관적이라고 느껴서
     * 리팩터링하면서 상위클래스로 끌어올리지 않았다.
     */
    abstract get getRight(): R|never;
    abstract get getLeft(): L|never;

    abstract flatMap<T, S>(fn: (v: R) => Either<T, S>): Either<L|T, S>;
    abstract flatMapPromise<T, S>(fn: (v: R) => Promise<Either<T, S>>): Promise<Either<L|T, S>>;

    map = <S>(fn: (v: R) => S) => this.flatMap<L, S>(v => Either.right(fn(v)));
}

class EitherRight<R> extends Either<never, R> {
    
    constructor(v: R) { super(v); }

    get getRight() {
        return this.getWhatever;}

    get getLeft(): never {
        throw new Error(`Either getLeft Error. Either is Right, value: ${this.getWhatever}`);}

    flatMap = <T, S>(fn: (v: R) => Either<T, S>) => fn(this.getWhatever);
    flatMapPromise = async <T, S>(fn: (v: R) => Promise<Either<T, S>>) => await fn(this.getWhatever);
}

class EitherLeft<L> extends Either<L, never> {

    constructor(v: L) { super(v); }

    get getRight(): never {
        throw new Error(`Either getRight Error. Either is Left, value: ${this.getWhatever}`);}

    get getLeft() {
        return this.getWhatever;}
    
    flatMap = <T, S>(fn: (v: never) => Either<T, S>) => Either.left<L, S>(this.getWhatever);
    flatMapPromise = async <T, S>(fn: (v: never) => Promise<Either<T, S>>) => Either.left<L, S>(this.getWhatever);
}