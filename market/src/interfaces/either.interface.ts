interface EitherI<L, R> {
    readonly isRight: boolean
    readonly isLeft: boolean
    readonly getWhatever: L|R
    readonly getRightOrThrowCustomError: (error: any) => R
    readonly getRightOrThrowError: R
    readonly getLeftOrThrowError: L
    readonly map: <S>(fn: (v: R) => S) => EitherI<L, S>
    readonly flatMap: <T, S>(fn: (v: R) => EitherI<S, T>) => EitherI<S|L, T>
    readonly flatMapPromise: <T, S>(fn: (v: R) => Promise<EitherI<S, T>>) => Promise<EitherI<S|L, T>>
}