import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";

export type Log_priceUpdateDocument = Log_priceUpdate & mongoose.Document;

@Schema({
    timestamps: true
 })
export class Log_priceUpdate {
    /**
     * 자동업데이트인가?
     * 거래소별 업데이트인가?
     * 커스텀 업데이트인가?
     * (거래소별업뎃일경우) exchange
     * (커스텀일경우) 업데이트 필터배열 | 티커배열 | etc
     * 마켓day
     * 시작일시
     * 종료일시
     * 소요시간
     */
}

export const Log_priceUpdateSchema = SchemaFactory.createForClass(Log_priceUpdate);