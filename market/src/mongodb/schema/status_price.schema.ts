import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";

export type Status_priceDocument = Status_price & mongoose.Document;

@Schema({
    timestamps: true
 })
export class Status_price {
    /**
     * exchange (id 역할가능)
     * 마켓day
     * yf_exchange
     * yf_exchangeTimezoneName
     * yf_exchangeTimezoneShortName
     */
}

export const Status_priceSchema = SchemaFactory.createForClass(Status_price);