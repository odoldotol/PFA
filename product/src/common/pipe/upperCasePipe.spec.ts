import { UpperCasePipe } from "./upperCasePipe";

describe('UpperCasePipe', () => {

  let pipe: UpperCasePipe;

  let testStr: { [k: `case${number}`]: string };
  let successStr: { [k: `case${number}`]: string };
  let testArr: { [k: `case${number}`]: Array<any> };
  let successArr: { [k: `case${number}`]: Array<any> };
  let testObj: { [k: `case${number}`]: object };
  let successObj: { [k: `case${number}`]: object };

  beforeEach(() => {
    pipe = new UpperCasePipe();

    testStr = {
      case1: 'abCdEFg',
      case2: 'HiJKlmn',
    };
    successStr = {
      case1: 'ABCDEFG',
      case2: 'HIJKLMN',
    };
    testArr = {
      case1: [testStr['case1'], undefined, testStr['case2'], null, 123],
    };
    successArr = {
      case1: [successStr['case1'], undefined, successStr['case2'], null, 123],
    };
    testObj = {
      case1: { a: testStr['case1'], b: undefined, c: testStr['case2'], d: null, e: 123 },
    };
    successObj = {
      case1: { a: successStr['case1'], b: undefined, c: successStr['case2'], d: null, e: 123 },
    };
  });

  it('should be defined', () => expect(pipe.transform).toBeDefined());

  describe('Case: undefined', () => {
    it('should return undefined', () =>
      expect(pipe.transform(undefined)).toBeUndefined());
  });

  describe('Case: string', () => {
    it('should return upper case string', () =>
      expect(pipe.transform(testStr['case1'])).toBe(successStr['case1']));
  });

  describe('Case: array', () => {
    it('should return upper case array', () =>
      expect(pipe.transform(testArr['case1'])).toEqual(successArr['case1']));

    it('multiple nested array', () =>
      expect(pipe.transform([[...testArr['case1']!, testArr['case1']]]))
        .toEqual([[...successArr['case1']!, successArr['case1']]]));

    it('combination in array', () =>
      expect(pipe.transform([...testArr['case1']!, testObj['case1']]))
        .toEqual([...successArr['case1']!, successObj['case1']]));

    it('combination in nested array', () =>
      expect(pipe.transform([[...testArr['case1']!, [...testArr['case1']!, testObj['case1']]]]))
        .toEqual([[...successArr['case1']!, [...successArr['case1']!, successObj['case1']]]]));
  });

  describe('Case: object', () => {
    it('should return upper case object', () =>
      expect(pipe.transform(testObj['case1'])).toEqual(successObj['case1']));

    it('multiple nested object', () =>
      expect(pipe.transform({ a: { b: { c: { d: testObj['case1'] } } } }))
        .toEqual({ a: { b: { c: { d: successObj['case1'] } } } }));

    it('combination in object', () =>
      expect(pipe.transform(Object.assign(testObj['case1']!, { 1: testArr['case1'] })))
        .toEqual(Object.assign(successObj['case1']!, { 1: successArr['case1'] })));

    it('combination in nested object', () =>
      expect(pipe.transform({ a: { b: { c: { d: testObj['case1'] }, f: testArr['case1'] } } }))
        .toEqual({ a: { b: { c: { d: successObj['case1'] }, f: successArr['case1'] } } }));
  });

});