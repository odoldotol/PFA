import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type Yf_infoDocument = Yf_info & Document;

@Schema()
export class Yf_info {
    @Prop({
        required: true,
        unique: true
    })
    symbol: string;
}

export const Yf_infoSchema = SchemaFactory.createForClass(Yf_info);