type MaximumOneOf<T, K extends keyof T = keyof T> = K extends keyof T ? {
  [P in K]?: T[K];
} & Partial<Record<Exclude<keyof T, K>, never>> : never;

type SetTTL = {
  expireSec?: number | null;
};

type SetIf = MaximumOneOf<{
  ifNotExist: true;
  ifExist: true;
}>;

export type SetOptions = SetTTL & SetIf;

export interface RedisServiceI {
  setOne: <T>([key, value]: [string, T], setOptions?: SetOptions) => Promise<T | null>;
  deleteOne: (key: string) => Promise<any>;
  getOne: (key: string) => Promise<any>;
}
