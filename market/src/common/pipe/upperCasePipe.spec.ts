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

});