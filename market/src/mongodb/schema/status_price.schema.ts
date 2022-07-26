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
    ISO_Code: string

    @Prop({
        required: true,
        type: String
    })
    lastMarketDate: string

    @Prop({
        required: true,
        unique: true,
        type: String
    })
    yf_exchangeTimezoneName: string
}

export const Status_priceSchema = SchemaFactory.createForClass(Status_price);