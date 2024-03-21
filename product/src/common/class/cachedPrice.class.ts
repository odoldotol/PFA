// Todo: Entity 변경에 따른 완전한 리팩터링 필요
// 추상화 하여, 이놈을 의존하는 많은 객체들은 추상을 의존하게 하고,
// Database 에서는 스키마 리팩터링, 그 외부에서는 구현에 의존금지

import { ApiProperty } from "@nestjs/swagger";
import { Currency, ExchangeIsoCode } from "../interface";
import { MarketDate } from "./marketDate.class";

export class CachedPrice {

  @ApiProperty({ type: Number, example: 160 })
  readonly price: number;
  @ApiProperty({ type: String, example: 'XNYS' })
  readonly ISO_Code: ExchangeIsoCode;
  @ApiProperty({ type: String, example: 'USD' })
  readonly currency: Currency;
  @ApiProperty({ type: String, example: '2023-03-25' })
  readonly marketDate: MarketDate;
  @ApiProperty({ type: Number, example: 1, description: '일간 조회수' })
  readonly count: number;

  constructor(price: CachedPrice) {
    this.price = price.price;
    this.ISO_Code = price.ISO_Code;
    this.currency = price.currency;
    this.marketDate = new MarketDate(price.marketDate);
    this.count = price.count;
  }

  // @ts-ignore
  incr_count() { this.count++; return this; }

}
