import { Ticker } from ".";

// Todo: 이 타입 왜 쓰는거야? 이거 최대한 삭제해
export type UpdateTuple = Readonly<[Ticker, number]>;