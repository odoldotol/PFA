import { Module } from '@nestjs/common';
import {
  Market_FinancialAssetModule
} from './financialAsset/financialAsset.module';
import { Market_ExchangeModule } from './exchange/exchange.module';
import { MarketService } from './market.service';
import CONFIG_EXCHANGES from 'src/config/const/exchange.const';

@Module({
  imports: [
    Market_FinancialAssetModule,
    Market_ExchangeModule.register(CONFIG_EXCHANGES)
  ],
  providers: [MarketService],
  exports: [
    Market_FinancialAssetModule,
    Market_ExchangeModule,
    MarketService
  ]
})
export class MarketModule {}
