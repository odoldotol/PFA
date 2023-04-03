import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ClientSession, FilterQuery, Model, UpdateQuery } from "mongoose";
import { Exchange_updateSet, Exchange_updateSetDocument } from "../schema/exchange_updateSet.schema";

@Injectable()
export class Exchange_updateSetRepository {

    constructor(
        @InjectModel(Exchange_updateSet.name) private model: Model<Exchange_updateSetDocument>,
    ) {}

}