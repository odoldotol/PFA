export type MaximumOneOf<T, K extends keyof T = keyof T>
= K extends keyof T ?
  {
    [P in K]?: T[K];
  } & Partial<Record<Exclude<keyof T, K>, never>> :
  never;

export type AtleastOneOf<T, K extends keyof T = keyof T>
= K extends keyof T ?
  {
    [P in K]: T[K];
  } :
  never;

/**
 * ### L Available: 1 ~ 10
 */
export type LimitedArray<T, L extends number> = [T, ...T[]] & {
  length: PositiveIntegerLessOrEqualThen<L>
};

/**
 * ### N Available : 1 ~ 10
 */
export type PositiveIntegerLessOrEqualThen<N extends number>
= N extends 0 ? never
: N extends 1 ? 1
: N extends 2 ? 1 | 2
: N extends 3 ? 1 | 2 | 3
: N extends 4 ? 1 | 2 | 3 | 4
: N extends 5 ? 1 | 2 | 3 | 4 | 5
: N extends 6 ? 1 | 2 | 3 | 4 | 5 | 6
: N extends 7 ? 1 | 2 | 3 | 4 | 5 | 6 | 7
: N extends 8 ? 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
: N extends 9 ? 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
: N extends 10 ? 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
: never;

export const isLimitedArray = <T, L extends number>(
  buttons: T[],
  limit: L
): buttons is Readonly<LimitedArray<T, L>> => {
  return buttons.length <= limit;
};