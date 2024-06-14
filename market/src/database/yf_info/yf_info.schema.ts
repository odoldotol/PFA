import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import {
  Currency,
  ExchangeName,
  IsoTimezoneName,
  QuoteType,
  Ticker,
  TimezoneShortName,
  YfInfo
} from "src/common/interface";

export type Yf_infoDocument = Yf_info & Document;

// Todo: yfinance_info 와 fast_info, metadata assign 한 것 사이의 차이 확인해보기, 애초에 info, fast_info, metadata, 전부 지켜서 저장하는 방식도 검토.
@Schema({
  timestamps: true,
  strict: false //
})
export class Yf_info
  implements YfInfo
{
  @Prop({
    required: true,
    unique: true,
    type: String,
  })
  symbol!: Ticker;

  @Prop({
    type: String,
  })
  currency!: Currency;

  @Prop({
    type: String,
  })
  quoteType!: QuoteType;

  /* 
  longName (환율이나 크립토 등 특별한 이름이 없는 항목에 없음)
  
  market : ( us_market | kr_market | ccc_market | ccy_market ... )
  
  exchange : 거래소
  exchangeTimezoneName : ( America/New_York | Asia/Seoul ... )
  exchangeTimezoneShortName : ( EST | EDT | KST | BST | UTC ... )
  
  regularMarketPreviousClose : 장중= 직전마켓 종가** | 장후= 직전마켓-1일 마켓의 종가
  regularMarketPrice : 장중= 현재가 | 장후= 직전마켓의 종가**
  */

  exchangeName!: ExchangeName;
  timezone!: TimezoneShortName;

  @Prop({
    required: true,
    type: String,
  })
  exchangeTimezoneName!: IsoTimezoneName;

  @Prop({
    required: true,
    type: Number,
  })
  regularMarketPrice!: number | null;

  @Prop({
    required: true,
    type: Number,
  })
  regularMarketPreviousClose!: number | null;

}

export const Yf_infoSchema = SchemaFactory.createForClass(Yf_info);