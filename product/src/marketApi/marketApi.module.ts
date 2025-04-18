import { Module } from '@nestjs/common';
import { HttpModule } from 'src/http';
import { RedisModule } from 'src/database';
import { NotFoundTickerRedisEntity } from './notFoundTicker.redis.entity';
import { ConnectionService } from './connection.service';
import { MarketApiConfigService } from 'src/config';
import { MarketApiService } from './marketApi.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: (
        marketApiConfigSrv: MarketApiConfigService
      ) => ({
        baseURL: marketApiConfigSrv.getBaseUrl(),
        timeout: marketApiConfigSrv.getTimeout(),
      }),
      inject: [MarketApiConfigService]
    }),
    RedisModule.forFeature([
      {
        entity: NotFoundTickerRedisEntity,
        ttl: 60 * 60 * 24 // todo
      },
    ]),
  ],
  providers: [
    ConnectionService,
    MarketApiService
  ],
  exports: [MarketApiService]
})
export class MarketApiModule {}
