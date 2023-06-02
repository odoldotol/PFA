import { Inject, Injectable } from "@nestjs/common";
import { MarketDate } from "src/common/class/marketDate.class";

@Injectable()
export class MarketDateService {

    constructor(
        @Inject(MarketDate.name+"REPOSITORY") private readonly marketDateRepo: InMemoryRepositoryI<MarketDate>,
    ) {}
    
    create = ([ISO_Code, marketDate]: Sp) => this.marketDateRepo.createOne(ISO_Code, marketDate);

    read = (ISO_Code: ISO_Code) => this.marketDateRepo.findOne(ISO_Code);

}