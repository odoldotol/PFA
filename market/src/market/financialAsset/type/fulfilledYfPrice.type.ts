import { TYf } from "src/market/type";

export type TFulfilledYfPrice = Readonly<{
  regularMarketLastClose: number;
}> & TYf;