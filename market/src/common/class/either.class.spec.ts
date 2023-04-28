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

});