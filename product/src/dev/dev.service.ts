import { Injectable } from '@nestjs/common';
import { DBRepository } from '@database.repository';
import { MarketService } from '@market.service';

@Injectable()
export class DevService {

    constructor(
        private readonly dbRepo: DBRepository,
        private readonly marketService: MarketService,) {}

    getPrice = this.marketService.getPrice;
    getAllMarketDate = this.marketService.getAllStatusPrice;
    getAllCacheKey = this.dbRepo.getAllCcKeys
}
