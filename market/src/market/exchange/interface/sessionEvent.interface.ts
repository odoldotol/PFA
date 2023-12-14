export type OpenEventArg = Readonly<{
  nextCloseDate: Date,
  nextUpdateDate: Date
}>;

export type CloseEventArg = Readonly<{
  nextOpenDate: Date
}>;

// export type OpenEventListener = (arg: TOpenEventArg) => void;
// export type CloseEventListener = (arg: TCloseEventArg) => void;
// export type IpdateEventListener = () => void;