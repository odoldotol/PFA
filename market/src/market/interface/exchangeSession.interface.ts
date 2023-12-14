export interface ExchangeSession {
  readonly nextOpen: Date;
  readonly nextClose: Date;
  readonly previousOpen: Date;
  readonly previousClose: Date;
}