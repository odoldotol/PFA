import {
  Prop,
  Schema,
  SchemaFactory
} from "@nestjs/mongoose";
import { Document } from "mongoose";

export type LaunchAlarmDocument = LaunchAlarm & Document;

@Schema({
  timestamps: true,
  strict: true,
})
export class LaunchAlarm {

  @Prop({
    required: true,
    type: Number,
  })
  userId!: number;

  @Prop({
    required: false,
    type: Array<LaunchAlarmRequest>,
    default: [],
  })
  requests!: LaunchAlarmRequest[]

}

export const LaunchAlarmSchema = SchemaFactory.createForClass(LaunchAlarm);

type LaunchAlarmRequest = {
  isFriend: boolean;
  date: Date;
};