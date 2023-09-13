import { TYf } from "src/market/asset/type";

export type TFulfilledYfPrice = Readonly<{
  regularMarketLastClose: number;
}> & TYf;