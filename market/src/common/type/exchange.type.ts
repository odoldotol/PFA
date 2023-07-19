export type TExchangeISO = Readonly<{
  ISO_Code: string;
  ISO_TimezoneName: string;
}>;

export type TExchangeCore = TExchangeISO & Readonly<{
  marketDate: string;
}>;