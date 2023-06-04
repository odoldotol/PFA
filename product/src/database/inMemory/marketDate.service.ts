import { Inject, Injectable } from "@nestjs/common";
import { MarketDate } from "src/common/class/marketDate.class";
import { INMEMORY_SCHEMA_REPOSITORY_SUFFIX } from "./const/injectionToken.const";

@Injectable()
export class MarketDateService {

    constructor(
        @Inject(MarketDate.name + INMEMORY_SCHEMA_REPOSITORY_SUFFIX) private readonly marketDateRepo: InMemoryRepositoryI<MarketDate>,
    ) {}
    
    create = ([ISO_Code, marketDate]: Sp) => this.marketDateRepo.createOne(ISO_Code, marketDate);

    read = (ISO_Code: ISO_Code) => this.marketDateRepo.findOne(ISO_Code);

}