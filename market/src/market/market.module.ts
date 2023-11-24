import { Module } from '@nestjs/common';
import { Market_FinancialAssetModule } from './financialAsset/financialAsset.module';
import { Market_ExchangeModule } from './exchange/exchange.module';

@Module({
  imports: [
    Market_FinancialAssetModule,
    Market_ExchangeModule,
  ],
  providers: [],
  exports: [
    Market_FinancialAssetModule,
    Market_ExchangeModule,
  ]
})
export class MarketModule {}
