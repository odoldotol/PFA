import { Module } from '@nestjs/common';
import { MarketApiService } from './market-api.service';

@Module({
  providers: [MarketApiService],
  exports: [MarketApiService]
})
export class MarketApiModule {}
