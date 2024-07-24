/**
 * #### 모든 속성의 완전한 descriptor 를 assign
 * 
 * ### options
 * @blacklist 요소와 일치하는 키의 속성은 assign 하지 않음
 * @onlyEnumerable false 면 enumerable 이 false 인 속성도 assign (default: true)
 * @symbolProperties false 면 symbol 속성은 assign 하지 않음 (default: true)
 */
export const completeAssign = (
  target: object,
  sources: any[],
  options?: CompleteAssignOptions,
) => {
  const setDescriptor = (
    descripers: PropertyDescriptorMap,
    key: PropertyKey,
    descriptor: PropertyDescriptor,
  ) => {
    if (options?.blacklist?.includes(key)) {
      return;
    }

    if (
      options?.onlyEnumerable !== false &&
      descriptor.enumerable === false
    ) {
      return;
    }

    descripers[key] = descriptor;
  };

  sources.forEach((source) => {
    const completeDescriptors: PropertyDescriptorMap = {};

    const descriptors = Object.getOwnPropertyDescriptors(source);
    for (const key in descriptors) {
      setDescriptor(completeDescriptors, key, descriptors[key]!);
    }

    if (options?.symbolProperties !== false) {
      Object.getOwnPropertySymbols(source).forEach((sym) => {
        let descriptor = Object.getOwnPropertyDescriptor(source, sym)!;
        setDescriptor(completeDescriptors, sym, descriptor);
      });
    }

    Object.defineProperties(target, completeDescriptors);
  });

  return target;
};

type CompleteAssignOptions = {
  blacklist?: PropertyKey[],
  onlyEnumerable?: boolean,
  symbolProperties?: boolean,
};

/////////////////////// Object Derived Interface ///////////////////////

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

///////////////////////////////////////////////////////////////////////