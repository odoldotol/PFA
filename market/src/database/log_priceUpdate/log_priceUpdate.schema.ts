import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { Launcher } from "src/common/enum";
import { FulfilledYfPrice } from "src/common/interface";

export type Log_priceUpdateDocument = Log_priceUpdate & mongoose.Document;

@Schema({
  timestamps: true
})
export class Log_priceUpdate {
  // Todo: Enum 으로
  @Prop({
    required: true,
    type: String,
    validate: [
      (v: Launcher) => Object.values(Launcher).includes(v),
      "Invalid launcher"
    ]
  }) // 업데이트 주체
  launcher!: Launcher

  @Prop({
    required: true,
    type: Boolean
  }) // 표준 업뎃인가 아닌가? (표준은 현제 ISO code 를 의미)
  isStandard!: boolean

  @Prop({
    required: true,
    type: mongoose.Schema.Types.Mixed // string | Array<string | Object>
  }) // 업데이트 키 (ISO code | 필터[] | 티커[] | etc...)
  key!: string | Array<string | Object>

  @Prop({
    type: mongoose.Schema.Types.Mixed
  })
  success!: FulfilledYfPrice[]

  @Prop({
    type: mongoose.Schema.Types.Mixed
  })
  failure!: any[]

  @Prop({
    required: true,
    type: String // ISO String
  }) // UTC
  startTime!: string

  @Prop({
    required: true,
    type: String // ISO String
  }) // UTC
  endTime!: string

  @Prop({
    required: true,
    type: Number
  }) // 소요된 시간 (밀리초)
  duration!: number
}

export const Log_priceUpdateSchema = SchemaFactory.createForClass(Log_priceUpdate);