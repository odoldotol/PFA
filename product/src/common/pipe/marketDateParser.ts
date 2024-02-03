// Todo: 제거

import { PipeTransform } from "@nestjs/common";
import { MarketDate } from "../class/marketDate.class";

export class MarketDateParser implements PipeTransform {
  transform(value: UpdatePriceByExchangeBodyI) {
    return value && Object.assign(value, { marketDateClass: new MarketDate(value.marketDate) });
  }
}
