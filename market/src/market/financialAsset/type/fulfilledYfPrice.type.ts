import { TYf } from "src/market/financialAsset/type";

export type TFulfilledYfPrice = Readonly<{
  regularMarketLastClose: number;
}> & TYf;