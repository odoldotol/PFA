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
        unique: true
    })
    symbol: string; // 거의 id 역할 가능

    /* 
        중요한 공통 props (100% 신뢰할 수는 없다)
        
        quoteType : 카테고리 역할

        currency : 표현 통화

        shortName : 이름으로 사용할놈

        market : 마켓 대분류 ( us_market | kr_market | ccc_market | ccy_market ... )

        exchange : 거래소
        exchangeTimezoneName : 거래소가 위치한 국가/도시 ( America/New_York | Asia/Seoul ... )
        exchangeTimezoneShortName : 타임존 이름 ( EST | EDT | KST | BST | UTC ... )

        regularMarketPreviousClose : 장중= 직전마켓 종가** | 장후= 직전마켓-1일 마켓의 종가
        regularMarketPrice : 장중= 현재가 | 장후= 직전마켓의 종가**
    */
}

export const Yf_infoSchema = SchemaFactory.createForClass(Yf_info);