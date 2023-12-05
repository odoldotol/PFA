import { Module } from '@nestjs/common';
import { Market_FinancialAssetModule } from './financialAsset/financialAsset.module';
import { Market_ExchangeModule } from './exchange/exchange.module';
import { exchangeConfigArr } from 'src/config/const';
import { MarketService } from './market.service';

@Module({
  imports: [
    Market_FinancialAssetModule,
    Market_ExchangeModule.register(exchangeConfigArr)
  ],
  providers: [MarketService],
  exports: [
    Market_FinancialAssetModule,
    Market_ExchangeModule,
    MarketService
  ]
})
export class MarketModule {}
