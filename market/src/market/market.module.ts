import { Module } from '@nestjs/common';
import { AssetModule } from './asset/asset.module';
import { ExchangeModule } from './exchange/exchange.module';

@Module({
  imports: [
    AssetModule,
    ExchangeModule,
  ],
  providers: [],
  exports: [
    AssetModule,
    ExchangeModule,
  ]
})
export class MarketModule {}
