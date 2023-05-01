import { Injectable } from '@nestjs/common';
import { DBRepository } from 'src/database/database.repository';
import { MarketService } from 'src/market/market.service';

@Injectable()
export class DevService {

    constructor(
        private readonly dbRepo: DBRepository,
        private readonly marketService: MarketService,) {}

    getPrice = this.marketService.getPrice;
    getAllMarketDate = this.marketService.getAllStatusPrice;
    getAllCacheKey = this.dbRepo.getAllCcKeys
}
