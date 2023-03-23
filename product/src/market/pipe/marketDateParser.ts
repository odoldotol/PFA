import { PipeTransform } from "@nestjs/common";
import { RegularUpdateForPriceBodyDto } from "../dto/regularUpdateForPriceBody.dto";
import { MarketDate } from "../../class/marketDate.class";

export class MarketDateParser implements PipeTransform {
    transform(value: RegularUpdateForPriceBodyDto) {
        return value && Object.assign(value, { marketDate: new MarketDate(value["marketDate"]) });
    }
}
