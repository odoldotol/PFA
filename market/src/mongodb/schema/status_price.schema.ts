import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";

export type Status_priceDocument = Status_price & mongoose.Document;

@Schema({
    timestamps: true
 })
export class Status_price {

    @Prop({
        required: true,
        unique: true,
        type: String
    })
    exchange: string // 일단은 = yf_exchange

    @Prop({
        required: true,
        type: Date
    })
    lastMarketDate: Date

    @Prop({
        required: true,
        unique: true,
        type: String
    })
    yf_exchange: string

    @Prop({
        required: true,
        type: String
    })
    yf_exchangeTimezoneName: string

    @Prop({
        required: true,
        type: String
    })
    yf_exchangeTimezoneShortName: string
}

export const Status_priceSchema = SchemaFactory.createForClass(Status_price);