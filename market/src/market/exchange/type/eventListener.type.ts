export type TOpenEventArg = { nextCloseDate: Date, nextUpdateDate: Date };
export type TCloseEventArg = { nextOpenDate: Date };

export type TOpenEventListener = (arg: TOpenEventArg) => void;
export type TCloseEventListener = (arg: TCloseEventArg) => void;
export type TIpdateEventListener = () => void;