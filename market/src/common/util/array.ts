import { PositiveIntegerLessOrEqualThen } from "./number";

//////////////////////////// LimitedArray ////////////////////////////

/**
 * ### L Available: 1 ~ 10
 */
export type LimitedArray<T, L extends number> = [T, ...T[]] & {
  length: PositiveIntegerLessOrEqualThen<L>
};

export const isLimitedArray = <T, L extends number>(
  array: T[],
  limit: L
): array is Readonly<LimitedArray<T, L>> => {
  return 1 <= array.length && array.length <= limit;
};

//////////////////////////////////////////////////////////////////////