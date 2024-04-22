/**
 * 주어진 제네릭 객체의 속성 중 아무것도 가지지 않거나 오직 하나만 가지는 객체타입
 */
export type MaximumOneOf<T, K extends keyof T = keyof T>
= K extends keyof T ? {
  [P in K]?: T[K];
} & Partial<Record<Exclude<keyof T, K>, never>> : never;

/**
 * 주어진 제네릭 객체의 속성 중 하나 이상 가지는 객체타입
 */
export type AtleastOneOf<T, K extends keyof T = keyof T>
= K extends keyof T ? {
  [P in K]: T[K];
} : never;

/**
 * 주어진 제네릭 객체의 속성 중 오직 하나만 가지는 객체타입
 */
export type OnlyOneOf<T, K extends keyof T = keyof T>
= K extends keyof T ? {
  [P in K]: T[K];
} & Partial<Record<Exclude<keyof T, K>, never>> : never;