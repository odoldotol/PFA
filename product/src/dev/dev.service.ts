import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { MarketService } from 'src/market/market.service';

@Injectable()
export class DevService {

  constructor(
    private readonly dbSrv: DatabaseService,
    private readonly marketService: MarketService,
  ) {}

  public getPrice(...args: Parameters<MarketService['getPrice']>) {
    return this.marketService.getPrice(...args);
  }

  public async getAllMarketDate() {
    const map = await this.dbSrv.getAllMarketDateAsMap();
    return Object.fromEntries(map);
  };

  public getAllCacheKey(...args: Parameters<DatabaseService['getAllCcKeys']>) {
    return this.dbSrv.getAllCcKeys(...args);
  }

}
