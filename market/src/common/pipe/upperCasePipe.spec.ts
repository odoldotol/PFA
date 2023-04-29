import { UpperCasePipe } from "./upperCasePipe";

describe('UpperCasePipe', () => {

    let pipe: UpperCasePipe;

    beforeEach(() => {
        pipe = new UpperCasePipe();
    });

    it('should be defined', () => expect(pipe.transform).toBeDefined());

    describe('Case: undefined', () => {
        it('should return undefined', () =>
            expect(pipe.transform(undefined)).toBeUndefined());});

    describe('Case: string', () => {      
        it('should return upper case string', () =>
            expect(pipe.transform('abCdEFg')).toBe('ABCDEFG'));});

    describe('Case: array', () => {    
        it('should return upper case array', () => 
            expect(pipe.transform(['abCdEFg', undefined, 'HiJKlmn', null, 123]))
            .toEqual(['ABCDEFG', undefined, 'HIJKLMN', null, 123]));

        it('multiple nested array', () => 
            expect(pipe.transform([['abCdEFg', undefined, 'HiJKlmn', null, 123, ['abCdEFg', undefined, 'HiJKlmn', null, 123]]]))
            .toEqual([['ABCDEFG', undefined, 'HIJKLMN', null, 123, ['ABCDEFG', undefined, 'HIJKLMN', null, 123]]]));

        it('combination in array', () =>
            expect(pipe.transform(['abCdEFg', undefined, 'HiJKlmn', null, 123, { a: 'abCdEFg', b: undefined, c: 'HiJKlmn', d: null, e: 123 }]))
            .toEqual(['ABCDEFG', undefined, 'HIJKLMN', null, 123, { a: 'ABCDEFG', b: undefined, c: 'HIJKLMN', d: null, e: 123 }]));

        it('combination in nested array', () =>
            expect(pipe.transform([['abCdEFg', undefined, 'HiJKlmn', null, 123, ['abCdEFg', undefined, 'HiJKlmn', null, 123], { a: 'abCdEFg', b: undefined, c: 'HiJKlmn', d: null, e: 123 }]]))
            .toEqual([['ABCDEFG', undefined, 'HIJKLMN', null, 123, ['ABCDEFG', undefined, 'HIJKLMN', null, 123], { a: 'ABCDEFG', b: undefined, c: 'HIJKLMN', d: null, e: 123 }]]));});

    describe('Case: object', () => {
        it('should return upper case object', () =>
            expect(pipe.transform({ a: 'abCdEFg', b: undefined, c: 'HiJKlmn', d: null, e: 123 }))
            .toEqual({ a: 'ABCDEFG', b: undefined, c: 'HIJKLMN', d: null, e: 123 }));

        it('multiple nested object', () =>
            expect(pipe.transform({ a: { b: { c: { d: { a: 'abCdEFg', b: undefined, c: 'HiJKlmn', d: null, e: 123 } } } } }))
            .toEqual({ a: { b: { c: { d: { a: 'ABCDEFG', b: undefined, c: 'HIJKLMN', d: null, e: 123 } } } } }));

        it('combination in object', () =>
            expect(pipe.transform({ a: 'abCdEFg', b: undefined, c: ['HiJKlmn', null, 123] }))
            .toEqual({ a: 'ABCDEFG', b: undefined, c: ['HIJKLMN', null, 123] }));

        it('combination in nested object', () =>
            expect(pipe.transform({ a: { b: { c: { d: { a: 'abCdEFg', b: undefined, c: 'HiJKlmn', d: null, e: 123 } }, f: ['abCdEFg', undefined, 'HiJKlmn', null, 123] } } }))
            .toEqual({ a: { b: { c: { d: { a: 'ABCDEFG', b: undefined, c: 'HIJKLMN', d: null, e: 123 } }, f: ['ABCDEFG', undefined, 'HIJKLMN', null, 123] } } }));});

});