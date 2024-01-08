import { Module } from '@nestjs/common';
import {
  Market_FinancialAssetModule
} from './financialAsset/financialAsset.module';
import { Market_ExchangeModule } from './exchange/exchange.module';
import { MarketService } from './market.service';

@Module({
  imports: [
    Market_FinancialAssetModule,
    Market_ExchangeModule
  ],
  providers: [MarketService],
  exports: [MarketService]
})
export class MarketModule {}
