// Todo: Entity 변경에 따른 완전한 리팩터링 필요

import { isString, not } from "@fxts/core"
import { ExchangeCore } from "../interface";

export class MarketDate extends String {

  constructor(arg: string | MarketDate) {
    if (isString(arg) && not(/^\d{4}-\d{2}-\d{2}$/.test(arg))) throw new Error(`Invalid MarketDate : ${arg}`);
    else if (arg instanceof MarketDate) arg = arg.get;
    super(arg);
  }

  static fromSpDoc(exchange: ExchangeCore): MarketDate {
    return new this(exchange.marketDate.slice(0, 10));
  }

  get get() {
    return this.valueOf();
  }

  static areEqual = (
    a: MarketDate | string | null,
    b: MarketDate | string | null
  ): boolean => {
    a = a instanceof MarketDate ? a.get : a;
    b = b instanceof MarketDate ? b.get : b;
    return Boolean(a && a == b);
  }
}
