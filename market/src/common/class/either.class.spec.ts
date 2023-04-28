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

});