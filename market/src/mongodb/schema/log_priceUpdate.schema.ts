import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";

export type Log_priceUpdateDocument = Log_priceUpdate & mongoose.Document;

@Schema({
    timestamps: true
 })
export class Log_priceUpdate {

    @Prop({
        required: true,
        type: String
    }) // 업데이트 주체
    launcher: "initiator" | "scheduler" | "admin" | "product"
    
    @Prop({
        required: true,
        type: Boolean
    }) // 레귤러 업뎃인가 아닌가? (레귤러는 현제 ISO code 를 의미)
    isRegular: boolean

    @Prop({
        required: true,
        type: mongoose.Schema.Types.Mixed
    }) // 업데이트 키 (ISO code | 필터[] | 티커[] | etc...)
    key: string | Array<string | Object>

    @Prop(Array<String>)
    successTickerArr: string[]

    @Prop(Array<String>)
    failTickerArr: string[]

    @Prop({
        type: mongoose.Schema.Types.Mixed
    }) // 있을시만
    error: any

    @Prop({
        required: true,
        type: String // ISO String
    }) // UTC
    startTime: string

    @Prop({
        required: true,
        type: String // ISO String
    }) // UTC
    endTime: string

    @Prop({
        required: true,
        type: Number
    }) // 소요된 시간 (밀리초)
    duration: number
}

export const Log_priceUpdateSchema = SchemaFactory.createForClass(Log_priceUpdate);