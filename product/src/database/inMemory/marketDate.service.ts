import { CACHE_MANAGER, Inject, Injectable } from "@nestjs/common";
import { Cache } from 'cache-manager';
import { MarketDate } from "src/common/class/marketDate.class";
import { AppMemoryService } from "./appMemory/appMemory.service";
import * as F from "@fxts/core";

@Injectable()
export class MarketDateService {

    constructor(
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
        private readonly appMemSrv: AppMemoryService
    ) {}

    private readonly marketDateRepo = {

        // Todo: 이미 있는 키 set 막기
        createOne: (ISO_Code: ISO_Code, marketDate: MarketDate) => F.pipe(
            this.cacheManager.set(ISO_Code + MarketDate.KEY_SUFFIX, marketDate, 0),
            this.copy),

        findOne: (ISO_Code: ISO_Code) => F.pipe(
            this.get(ISO_Code),
            this.copy),
        
        // Todo: 존재하는 키만 set 허용하기
        updateOne: (ISO_Code: ISO_Code, update: Partial<MarketDate>) => F.pipe(
            this.get(ISO_Code),
            this.copy,
            v => v && Object.assign(v, update),
            v => v && this.create([ISO_Code, v])),
        
        // Todo: 존재하는 키만 del 허용하기
        deleteOne: (ISO_Code: ISO_Code) => this.cacheManager.del(ISO_Code + MarketDate.KEY_SUFFIX),

    }
    
    create = ([ISO_Code, marketDate]: Sp) => this.marketDateRepo.createOne(ISO_Code, marketDate);

    read = (ISO_Code: ISO_Code) => this.marketDateRepo.findOne(ISO_Code);

    private get = (ISO_Code: ISO_Code) => F.pipe(
        this.cacheManager.get(ISO_Code + MarketDate.KEY_SUFFIX),
        this.passMarketDate);
    
    private passMarketDate = (v: any) => v instanceof MarketDate ? v : null;

    private copy = (v: MarketDate | null) => v && new MarketDate(v);

}