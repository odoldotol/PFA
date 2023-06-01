import { Injectable } from "@nestjs/common";
import { MarketDateRepository } from "./appMemory/marketDate.repository";

@Injectable()
export class MarketDateService {

    constructor(
        private readonly marketDateRepo: MarketDateRepository,
    ) {}
    
    create = ([ISO_Code, marketDate]: Sp) => this.marketDateRepo.createOne(ISO_Code, marketDate);

    read = (ISO_Code: ISO_Code) => this.marketDateRepo.findOne(ISO_Code);

}