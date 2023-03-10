import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Config_exchange, Config_exchangeDocument } from "../schema/config_exchange.schema";

@Injectable()
export class Config_exchangeRepository {

    constructor(
        @InjectModel(Config_exchange.name) private config_exchangeModel: Model<Config_exchangeDocument>,
    ) {}
    
    /**
     * ### findAllIsoCodeAndTimezone
     */
    findAllIsoCodeAndTimezone = () => this.config_exchangeModel.find({}, "-_id ISO_Code ISO_TimezoneName").lean().exec();
    
    /**
     * ### findMarginMilliseconds
     */
    findMarginMilliseconds = (ISO_Code: string) => this.config_exchangeModel.findOne({ISO_Code}, "-_id update_margin_milliseconds").lean().exec()
        .then((obj) => obj["update_margin_milliseconds"]);

    /**
     * ### 하나 생성
     */
    createOne = (reqBody: Config_exchange) => this.config_exchangeModel.create(reqBody);

}