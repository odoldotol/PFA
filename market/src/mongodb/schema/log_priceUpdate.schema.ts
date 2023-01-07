import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";

export type Log_priceUpdateDocument = Log_priceUpdate & mongoose.Document;

@Schema({
    timestamps: true
 })
export class Log_priceUpdate {

    @Prop({
        required: true,
        type: String // "initiator" | "scheduler" | "admin" | "product"
    }) // 업데이트 주체
    launcher: "initiator" | "scheduler" | "admin" | "product"
    
    @Prop({
        required: true,
        type: Boolean
    }) // 표준 업뎃인가 아닌가? (표준은 현제 ISO code 를 의미)
    isStandard: boolean

    @Prop({
        required: true,
        type: mongoose.Schema.Types.Mixed // string | Array<string | Object>
    }) // 업데이트 키 (ISO code | 필터[] | 티커[] | etc...)
    key: string | Array<string | Object>

    @Prop({
        type: mongoose.Schema.Types.Mixed // Array<[String, Object]>
    })
    success: [string, object][]

    @Prop({
        type: mongoose.Schema.Types.Mixed
    })
    failure: any[]

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