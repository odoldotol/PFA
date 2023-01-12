import { CacheModule, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { MarketService } from './market.service';
import { MarketController } from './market.controller';

@Module({
  imports: [
    CacheModule.register({
      ttl: 60 * 60 * 24 * 5, // 5 days
    }),
    HttpModule.register({
      timeout: 90000,
    }),
  ],
  controllers: [MarketController],
  providers: [MarketService],
  exports: [MarketService]
})
export class MarketModule {}
