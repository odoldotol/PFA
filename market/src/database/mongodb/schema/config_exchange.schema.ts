import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";

export type Config_exchangeDocument = Config_exchange & mongoose.Document;

@Schema({
    timestamps: true
 })
export class Config_exchange {

    /**
     * 참고
     * https://github.com/gerrymanoim/exchange_calendars#calendars
     * https://www.iso20022.org/market-identifier-codes
     */

    @Prop({
        required: true,
        type: String
    })
    market: string

    @Prop({
        required: true,
        unique: true,
        type: String
    })
    ISO_Code: string

    @Prop({
        type: String
    })
    country: string

    @Prop({
        type: String
    })
    exchange_website: string

    @Prop({
        required: true,
        type: String
    })
    ISO_TimezoneName: string

    @Prop({
        type: Number
    })
    update_margin_milliseconds: number
}

export const Config_exchangeSchema = SchemaFactory.createForClass(Config_exchange);