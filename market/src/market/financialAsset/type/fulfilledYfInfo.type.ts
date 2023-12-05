import { Market_Exchange } from "src/market/exchange/class/exchange"
import { TFulfilledYfPrice } from ".";
import { TYfInfo } from "src/market/type";

export type TFulfilledYfInfo = Readonly<{
  marketExchange?: Market_Exchange;
}> & TYfInfo & TFulfilledYfPrice;