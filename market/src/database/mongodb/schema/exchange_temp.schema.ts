import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";

export type ExchangeDocument = Exchange & mongoose.Document;

@Schema({
    timestamps: true
 })
export class Exchange {

    @Prop({
        required: true,
        unique: true,
        type: String
    })
    ISO_Code!: string

    @Prop({
        required: true,
        type: String, // ISO String
    })
    lastMarketDate!: string

    @Prop({
        required: true,
        unique: true,
        type: String
    })
    yf_exchangeTimezoneName!: string
}

export const ExchangeSchema = SchemaFactory.createForClass(Exchange);