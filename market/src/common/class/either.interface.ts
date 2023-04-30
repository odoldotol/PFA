interface EitherI<L, R> {

    isRight: () => boolean;
    isLeft: () => boolean;

    getWhatever: L|R;
    getRight: R;
    getLeft: L;

    flatMap: <T, S>(fn: (v: R) => EitherI<T, S>) =>
        EitherI<L|T, S>;
    
    flatMapPromise: <T, S>(fn: (v: R) => Promise<EitherI<T, S>>) =>
        Promise<EitherI<L|T, S>>;

    map: <S>(fn: (v: R) => S) =>
        EitherI<L, S>;
}