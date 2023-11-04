import { Exchange } from "src/market/exchange/class/exchange"
import { TYfInfo, TFulfilledYfPrice } from "./";

export type TFulfilledYfInfo = Readonly<{
  marketExchange?: Exchange;
}> & TYfInfo & TFulfilledYfPrice;