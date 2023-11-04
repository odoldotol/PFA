import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type Yf_infoDocument = Yf_info & Document;

@Schema({
  timestamps: true,
  strict: false //
})
export class Yf_info {
  @Prop({
    required: true,
    unique: true,
    type: String,
  })
  symbol!: string;

  @Prop({
    type: String,
  })
  currency!: string

  @Prop({
    type: String,
  })
  quoteType!: string

  /* 
  longName (환율이나 크립토 등 특별한 이름이 없는 항목에 없음)
  
  market : ( us_market | kr_market | ccc_market | ccy_market ... )
  
  exchange : 거래소
  exchangeTimezoneName : ( America/New_York | Asia/Seoul ... )
  exchangeTimezoneShortName : ( EST | EDT | KST | BST | UTC ... )
  
  regularMarketPreviousClose : 장중= 직전마켓 종가** | 장후= 직전마켓-1일 마켓의 종가
  regularMarketPrice : 장중= 현재가 | 장후= 직전마켓의 종가**
  */

  @Prop({
    required: true,
    type: String,
  })
  exchangeTimezoneName!: string;

  @Prop({
    required: true,
    type: Number,
  })
  regularMarketPrice!: number; // 장중 아닐때 접근

  @Prop({
    required: true,
    type: Number,
  })
  regularMarketPreviousClose!: number; // 장중일때 접근

}

export const Yf_infoSchema = SchemaFactory.createForClass(Yf_info);