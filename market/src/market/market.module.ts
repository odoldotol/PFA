import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MarketService } from './market.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 90000,
    }),
  ],
  providers: [MarketService],
  exports: [MarketService]
})
export class MarketModule {}
