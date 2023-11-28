import { Exchange } from "src/market/exchange/class/exchange"
import { TFulfilledYfPrice } from ".";
import { TYfInfo } from "src/market/type";

export type TFulfilledYfInfo = Readonly<{
  marketExchange?: Exchange;
}> & TYfInfo & TFulfilledYfPrice;