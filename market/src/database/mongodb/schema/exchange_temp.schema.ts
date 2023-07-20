import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { TExchangeCore } from "src/common/type/exchange.type";

export type ExchangeDocument = Exchange & mongoose.Document;

@Schema({
    timestamps: true
 })
export class Exchange implements TExchangeCore {

    @Prop({
        required: true,
        unique: true,
        type: String
    })
    ISO_Code!: string

    @Prop({
        required: true,
        unique: true,
        type: String
    })
    ISO_TimezoneName!: string    

    @Prop({
        required: true,
        type: String, // ISO String
    })
    marketDate!: string
}

export const ExchangeSchema = SchemaFactory.createForClass(Exchange);