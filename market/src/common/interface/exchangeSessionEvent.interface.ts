import { Market_Exchange } from "src/market/exchange/class";

export type OpenEventArg = Readonly<{
  nextCloseDate: Date,
  nextUpdateDate: Date
}>;

export type CloseEventArg = Readonly<{
  nextOpenDate: Date
}>;

export type UpdateEventArg = Market_Exchange

// export type OpenEventListener = (arg: TOpenEventArg) => void;
// export type CloseEventListener = (arg: TCloseEventArg) => void;
export type UpdateEventListener = (arg: UpdateEventArg) => void;