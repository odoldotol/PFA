import { Injectable } from '@nestjs/common';
import { MarketDateService } from 'src/database/marketDate/marketDate.service';
import { RedisService } from 'src/database/redis/redis.service';

@Injectable()
export class DevService {

  constructor(
    private readonly redisSrv: RedisService,
    private readonly marketDateSrv: MarketDateService,
  ) {}

  public async getAllMarketDate() {
    const map = await this.marketDateSrv.getAllAsMap();
    return Object.fromEntries(map);
  };

  public getAllCacheKey() {
    return this.redisSrv.getAllKeys();
  }

}
