import { Either } from "./either";

describe('Either', () => {

    let eitherRight: Either<string, string>
    let eitherLeft: Either<string, string>

    enum testValue { right = 'right_value', left = 'left_value' }

    beforeEach(() => {
        eitherRight = Either.right(testValue.right);
        eitherLeft = Either.left(testValue.left);});

    it('Either should be defined', () => {
        expect(Either).toBeDefined();
        expect(eitherRight).toBeDefined();
        expect(eitherLeft).toBeDefined();});

    describe('check either Right or Left', () => {
        it('isRight', () => {
            expect(eitherRight.isRight()).toBeTruthy();
            expect(eitherLeft.isRight()).toBeFalsy();});
            
        it('isLeft', () => {
            expect(eitherRight.isLeft()).toBeFalsy();
            expect(eitherLeft.isLeft()).toBeTruthy();});});
    
    describe('creation', () => {
        it('Either.right', () => {
            expect(eitherRight).toBeInstanceOf(Either);
            expect(eitherRight.isRight()).toBeTruthy();
            expect(eitherRight.isLeft()).toBeFalsy()});
    
        it('Either.left', () => {
            expect(eitherLeft).toBeInstanceOf(Either);
            expect(eitherLeft.isLeft()).toBeTruthy();
            expect(eitherLeft.isRight()).toBeFalsy()});});

    describe('get value', () => {
        it('getWhatever', () => {
            expect(eitherRight.getWhatever).toBe(testValue.right);
            expect(eitherLeft.getWhatever).toBe(testValue.left);});

        it('getRight', () => {
            expect(eitherRight.getRight).toBe(testValue.right);
            expect(() => eitherLeft.getRight).toThrow();});

        it('getLeft', () => {
            expect(() => eitherRight.getLeft).toThrow();
            expect(eitherLeft.getLeft).toBe(testValue.left);});});
    
    describe('flatMap', () => {
        const fnR = (v: string): Either<boolean, number> => Either.right(v.length);
        const fnL = (v: string): Either<boolean, number> => Either.left(v === testValue.right);
        const promiseFnR = (v: string): Promise<Either<boolean, number>> => Promise.resolve(Either.right(v.length));
        const promiseFnL = (v: string): Promise<Either<boolean, number>> => Promise.resolve(Either.left(v === testValue.right));
        const asyncFnR = async (v: string): Promise<Either<boolean, number>> => Either.right(v.length);
        const asyncFnL = async (v: string): Promise<Either<boolean, number>> => Either.left(v === testValue.right);

        describe('Sync', () => { flatMapTest(fnL, fnR); });
        describe('Async', () => { flatMapTest(asyncFnL, asyncFnR); });
        describe('Promise', () => { flatMapTest(promiseFnL, promiseFnR); });
    });
    
    describe('map', () => {
        const fn = (v: string) => v.length;
        const promiseFn = (v: string) => Promise.resolve(v.length);
        const asyncFn = async (v: string) => v.length;

        describe('Sync', () => { mapTest(fn); });
        describe('Async', () => { mapTest(asyncFn); });
        describe('Promise', () => { mapTest(promiseFn); });
    });


    function flatMapTest(
        leftFn: (p: any) => Either<any, any>|Promise<Either<any, any>>,
        rightFn: (p: any) => Either<any, any>|Promise<Either<any, any>>,
    ) {
        it('eitherRight, if fn return right', async () => {
            const newEitherRight = eitherRight.flatMap(rightFn);
            expect(newEitherRight).toBeInstanceOf(Promise);
            expect((await newEitherRight).isRight()).toBeTruthy();
            expect((await newEitherRight).getRight).toBe(11);});

        it('eitherRight, if fn return left', async () => {
            const newEitherRight = eitherRight.flatMap(leftFn);
            expect(newEitherRight).toBeInstanceOf(Promise);
            expect((await newEitherRight).isLeft()).toBeTruthy();
            expect((await newEitherRight).getLeft).toBe(true);});

        it('eitherLeft', async () => {
            const newEitherLeft1 = eitherLeft.flatMap(rightFn);
            const newEitherLeft2 = eitherLeft.flatMap(leftFn);
            expect(newEitherLeft1).toBeInstanceOf(Promise);
            expect(newEitherLeft2).toBeInstanceOf(Promise);
            expect((await newEitherLeft1).isLeft()).toBeTruthy();
            expect((await newEitherLeft2).isLeft()).toBeTruthy();
            expect((await newEitherLeft1).getLeft).toBe(testValue.left);
            expect((await newEitherLeft2).getLeft).toBe(testValue.left);});
    }

    function mapTest(fn: (p: any) => any|Promise<any>) {
        it('eitherRight', async () => {
            const newEitherRight = eitherRight.map(fn);
            expect(newEitherRight).toBeInstanceOf(Promise);
            expect((await newEitherRight).isRight()).toBeTruthy();
            expect((await newEitherRight).getRight).toBe(11);});

        it('eitherLeft', async () => {
            const newEitherLeft = eitherLeft.map(fn);
            expect(newEitherLeft).toBeInstanceOf(Promise);
            expect((await newEitherLeft).isLeft()).toBeTruthy();
            expect((await newEitherLeft).getLeft).toBe(testValue.left);});
    }
});