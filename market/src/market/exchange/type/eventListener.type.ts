export type TOpenEventArgs = [ Date, Date ];
export type TCloseEventArgs = [ Date ];

export type TOpenEventListener = (...args: TOpenEventArgs) => void;
export type TCloseEventListener = (...args: TCloseEventArgs) => void;
export type TIpdateEventListener = () => void;