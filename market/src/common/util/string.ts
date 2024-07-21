export const joinUnderbar = (...stringArr: string[]): string => stringArr.join("_");
export const joinColon = (...stringArr: string[]): string => stringArr.join(":");
export const joinSlash = (...stringArr: string[]): string => stringArr.join("/");

export const dedupStrIter = (
  iterable: Iterable<string>
): Iterable<string> => new Set(iterable).values();

export type Month = `0${PositiveDigit}` | '10' | '11' | '12';

export type Day = `0${PositiveDigit}` | '10' | '11' | '12' | '13' | '14' | '15' | '16' | '17' | '18' | '19' | '20' | '21' | '22' | '23' | '24' | '25' | '26' | '27' | '28' | '29' | '30' | '31';

export type Digit = '0' | PositiveDigit;
export type PositiveDigit = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';