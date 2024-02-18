import { PipeTransform } from "@nestjs/common";
import { UpdatePriceByExchangeBodyDto } from "../dto/updatePriceByExchangeBody.dto";
import { MarketDate } from "src/common/class/marketDate.class";

export class MarketDateParser
  implements PipeTransform
{
  transform(value: UpdatePriceByExchangeBodyDto) {
    return value && {
      ...value,
      marketDate: new MarketDate(value.marketDate),
    };
  }
}
