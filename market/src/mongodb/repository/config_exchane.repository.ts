import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Config_exchange, Config_exchangeDocument } from "../schema/config_exchange.schema";
import { ConfigExchangeDto } from "../../manager/dto/configExchange.dto";

@Injectable()
export class Config_exchangeRepository {

    constructor(
        @InjectModel(Config_exchange.name) private config_exchangeModel: Model<Config_exchangeDocument>,
    ) {}
    
    /**
     * ###
     * - yahoofinance.service.setIsoCodeToTimezone
     */
    findAllIsoCodeAndTimezone() {
        try {
            return this.config_exchangeModel.find({}, "-_id ISO_Code ISO_TimezoneName").lean().exec();
        } catch (error) {
            throw error;
        };
    }
    
    /**
     * ###
     */
    getMarginMilliseconds(ISO_Code: string) {
        return this.config_exchangeModel.findOne({ISO_Code}, "-_id update_margin_milliseconds").lean().exec()
        .then((obj) => obj["update_margin_milliseconds"]);
    }

    /**
     * ### 하나 생성
     */
    create(reqBody: ConfigExchangeDto) {
        try {
            return this.config_exchangeModel.create(reqBody);
        } catch (error) {
            throw error;
        };
    }

}