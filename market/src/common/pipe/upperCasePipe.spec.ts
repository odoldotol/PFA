import { UpperCasePipe } from "./upperCasePipe";

describe('UpperCasePipe', () => {

    let pipe: UpperCasePipe;

    beforeEach(() => {
        pipe = new UpperCasePipe();
    });

    it('should be defined', () => {
        expect(pipe.transform).toBeDefined();
    });

    describe('Case: undefined', () => {
                
        it('should return undefined', () => {
            const result = pipe.transform(undefined);
            expect(result).toBeUndefined();
        });
    });

    describe('Case: string', () => {
            
        it('should return upper case string', () => {
            const result = pipe.transform('abCdEFg');
            expect(result).toBe('ABCDEFG');
        });
    
    });

    describe('Case: array', () => {
                
        it('should return upper case array', () => {
            const result = pipe.transform(['abCdEFg', undefined, 'HiJKlmn', null, 123]);
            expect(result).toEqual(['ABCDEFG', undefined, 'HIJKLMN', null, 123]);
        });

        it.todo('multiple nested array');

        it.todo('combination in array');
        
    });

    describe('Case: object', () => {

        it.todo('should return upper case object');

        it.todo('multiple nested object');

        it.todo('combination in object');

    });

});