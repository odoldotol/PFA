export type TExchangeSession = Readonly<{
  previous_open: string;
  previous_close: string;
  next_open: string;
  next_close: string;
}>;

export type TExchangeSessionError = Readonly<{
  doc: string
  ISO_Code: string
}>;