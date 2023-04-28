import { Either, EitherRight, EitherLeft } from "./either.class";

describe('Either', () => {

    it('Either should be defined', () => {
        expect(Either).toBeDefined();});
    
    it('EitherRight should be defined', () => {
        expect(EitherRight).toBeDefined();});
    
    it('EitherLeft should be defined', () => {
        expect(EitherLeft).toBeDefined();});
    
    it('Either.right', () => {
        expect(Either.right('right_value')).toBeInstanceOf(EitherRight);
    });

    it('Either.left', () => {
        expect(Either.left('left_value')).toBeInstanceOf(EitherLeft);
    });

});