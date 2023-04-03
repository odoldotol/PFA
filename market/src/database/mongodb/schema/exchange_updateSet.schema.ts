import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";

export type Exchange_updateSetDocument = Exchange_updateSet & mongoose.Document;

@Schema({
    timestamps: true
 })
export class Exchange_updateSet implements ExchangeUpdateSet {

    @Prop({
        required: true,
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Config_exchange'
    })
    config_exchange: mongoose.Schema.Types.ObjectId

    @Prop({
        required: true,
        type: String, // ISO String
    })
    lastMarketDate: string

    @Prop({
        required: true,
        type: Object //
    })
    assets: Assets

}

export const Exchange_updateSetSchema = SchemaFactory.createForClass(Exchange_updateSet);