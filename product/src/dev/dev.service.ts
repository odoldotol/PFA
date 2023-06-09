import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { MarketService } from 'src/market/market.service';

@Injectable()
export class DevService {

    constructor(
        private readonly dbSrv: DatabaseService,
        private readonly marketService: MarketService,) {}

    getPrice = this.marketService.getPrice;
    getAllMarketDate = this.marketService.getAllStatusPrice;
    getAllCacheKey = this.dbSrv.getAllCcKeys
}
