import { Market_Exchange } from "src/market/exchange/class";

export type OpenEventArg = Readonly<{
  closeDate: Date;
}>;

export type CloseEventArg = Readonly<{
  updateDate: Date | null;
  nextOpenDate: Date;
}>;

export type UpdateEventArg = Market_Exchange

// export type OpenEventListener = (arg: TOpenEventArg) => void;
// export type CloseEventListener = (arg: TCloseEventArg) => void;
export type UpdateEventListener = (arg: UpdateEventArg) => void;