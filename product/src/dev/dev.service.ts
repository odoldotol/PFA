import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { MarketService } from 'src/market/market.service';

@Injectable()
export class DevService {

    constructor(
        private readonly dbSrv: DatabaseService,
        private readonly marketService: MarketService,) {}

    getPrice = this.marketService.getPrice;

    public async getAllMarketDate() {
        const map = await this.dbSrv.getAllMarketDateAsMap();
        return Object.fromEntries(map);
    };
    
    getAllCacheKey = this.dbSrv.getAllCcKeys
}
