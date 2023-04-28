import { Either, EitherRight, EitherLeft } from "./either.class";

describe('Either', () => {

    it('Either should be defined', () => {
        expect(Either).toBeDefined();});
    
    it('EitherRight should be defined', () => {
        expect(EitherRight).toBeDefined();});
    
    it('EitherLeft should be defined', () => {
        expect(EitherLeft).toBeDefined();});
    
    describe('creation', () => {
        it('Either.right', () => {
            const eitherRight = Either.right<string, string>('right_value');
            expect(eitherRight).toBeInstanceOf(EitherRight);
            expect(eitherRight).toBeInstanceOf(Either);
            expect(eitherRight).not.toBeInstanceOf(EitherLeft);
        });
    
        it('Either.left', () => {
            const eitherLeft = Either.left<string, string>('left_value');
            expect(eitherLeft).toBeInstanceOf(EitherLeft);
            expect(eitherLeft).toBeInstanceOf(Either);
            expect(eitherLeft).not.toBeInstanceOf(EitherRight);
        });
    });

    describe('check either Right or Left', () => {
        it('Right', () => {
            const eitherRight = Either.right<string, string>('right_value');
            expect(eitherRight.isRight()).toBeTruthy();
            expect(eitherRight.isLeft()).toBeFalsy();
        });
    
        it('Left', () => {
            const eitherLeft = Either.left<string, string>('left_value');
            expect(eitherLeft.isRight()).toBeFalsy();
            expect(eitherLeft.isLeft()).toBeTruthy();
        });
    });

    describe('get value', () => {
        it('Right', () => {
            const eitherRight = Either.right<string, string>('right_value');
            expect(eitherRight.getWhatever).toBe('right_value');
            expect(eitherRight.getRight).toBe('right_value');
            expect(() => eitherRight.getLeft).toThrow();
        });
    
        it('Left', () => {
            const eitherLeft = Either.left<string, string>('left_value');
            expect(eitherLeft.getWhatever).toBe('left_value');
            expect(eitherLeft.getLeft).toBe('left_value');
            expect(() => eitherLeft.getRight).toThrow();
        });
    });

});