import { Either, EitherRight, EitherLeft } from "./either.class";

describe('Either', () => {

    it('Either should be defined', () => {
        expect(Either).toBeDefined();});
    
    it('EitherRight should be defined', () => {
        expect(EitherRight).toBeDefined();});
    
    it('EitherLeft should be defined', () => {
        expect(EitherLeft).toBeDefined();});
    
    let eitherRight: Either<string, string>
    let eitherLeft: Either<string, string>

    beforeEach(() => {
        eitherRight = Either.right('right_value');
        eitherLeft = Either.left('left_value');});
    
    describe('creation', () => {
        it('Either.right', () => {
            expect(eitherRight).toBeInstanceOf(EitherRight);
            expect(eitherRight).toBeInstanceOf(Either);
            expect(eitherRight).not.toBeInstanceOf(EitherLeft);});
    
        it('Either.left', () => {
            expect(eitherLeft).toBeInstanceOf(EitherLeft);
            expect(eitherLeft).toBeInstanceOf(Either);
            expect(eitherLeft).not.toBeInstanceOf(EitherRight);});});

    describe('check either Right or Left', () => {
        it('Right', () => {
            expect(eitherRight.isRight()).toBeTruthy();
            expect(eitherRight.isLeft()).toBeFalsy();});

        it('Left', () => {
            expect(eitherLeft.isRight()).toBeFalsy();
            expect(eitherLeft.isLeft()).toBeTruthy();});});

    describe('get value', () => {
        it('Right', () => {
            expect(eitherRight.getWhatever).toBe('right_value');
            expect(eitherRight.getRight).toBe('right_value');
            expect(() => eitherRight.getLeft).toThrow();});

        it('Left', () => {
            expect(eitherLeft.getWhatever).toBe('left_value');
            expect(eitherLeft.getLeft).toBe('left_value');
            expect(() => eitherLeft.getRight).toThrow();});});
    
    describe('flatMap', () => {
        const fnR = (v: string): Either<boolean, number> => Either.right(v.length);
        const fnL = (v: string): Either<boolean, number> => Either.left(v === "right_value");

        it('eitherRight, if fn return right', () => {
            const newEitherRight = eitherRight.flatMap(fnR);
            expect(newEitherRight).toBeInstanceOf(EitherRight);
            expect(newEitherRight.getRight).toBe(11);});

        it('eitherRight, if fn return left', () => {
            const newEitherRight = eitherRight.flatMap(fnL);
            expect(newEitherRight).toBeInstanceOf(EitherLeft);
            expect(newEitherRight.getLeft).toBe(true);});

        it('eitherLeft, if fn return right', () => {
            const newEitherLeft1 = eitherLeft.flatMap(fnR);
            const newEitherLeft2 = eitherLeft.flatMap(fnL);
            expect(newEitherLeft1).toBeInstanceOf(EitherLeft);
            expect(newEitherLeft2).toBeInstanceOf(EitherLeft);
            expect(newEitherLeft1.getLeft).toBe('left_value');
            expect(newEitherLeft2.getLeft).toBe('left_value');});
    });

});