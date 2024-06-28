export const joinUnderbar = (...stringArr: string[]): string => stringArr.join("_");
export const joinColon = (...stringArr: string[]): string => stringArr.join(":");

export const dedupStrIter = (
  iterable: Iterable<string>
): Iterable<string> => new Set(iterable).values();