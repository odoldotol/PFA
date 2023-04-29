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

        it('should return upper case object', () => {
            const result = pipe.transform({ a: 'abCdEFg', b: undefined, c: 'HiJKlmn', d: null, e: 123 });
            expect(result).toEqual({ a: 'ABCDEFG', b: undefined, c: 'HIJKLMN', d: null, e: 123 });
        });

        it('multiple nested object', () => {
            const result = pipe.transform({ a: { b: { c: { d: { a: 'abCdEFg', b: undefined, c: 'HiJKlmn', d: null, e: 123 } } } } });
            expect(result).toEqual({ a: { b: { c: { d: { a: 'ABCDEFG', b: undefined, c: 'HIJKLMN', d: null, e: 123 } } } } });
        });

        it('combination in object', () => {
            const result = pipe.transform({ a: 'abCdEFg', b: undefined, c: ['HiJKlmn', null, 123] });
            expect(result).toEqual({ a: 'ABCDEFG', b: undefined, c: ['HIJKLMN', null, 123] });
        });

        it('combination in nested object', () => {
            const result = pipe.transform({ a: { b: { c: { d: { a: 'abCdEFg', b: undefined, c: 'HiJKlmn', d: null, e: 123 } }, f: ['abCdEFg', undefined, 'HiJKlmn', null, 123] } } });
            expect(result).toEqual({ a: { b: { c: { d: { a: 'ABCDEFG', b: undefined, c: 'HIJKLMN', d: null, e: 123 } }, f: ['ABCDEFG', undefined, 'HIJKLMN', null, 123] } } });
        });
    });

});