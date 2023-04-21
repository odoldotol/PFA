import { Module } from '@nestjs/common';
import { MarketService } from './market.service';
import { ChildApiModule } from './child-api/child-api.module';

@Module({
  imports: [ChildApiModule],
  providers: [MarketService],
  exports: [MarketService]
})
export class MarketModule {}
