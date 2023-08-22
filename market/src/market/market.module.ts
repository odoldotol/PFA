import { Module } from '@nestjs/common';
import { ExchangeService } from './exchange.service';
import { ExchangeContainer } from './exchangeContainer';
import { ExchangeConfigArrProvider } from './provider/exchangeConfigArr.provider';
import { AssetModule } from './asset/asset.module';

@Module({
  imports: [
    AssetModule,
  ],
  providers: [
    ExchangeService,
    ExchangeContainer,
    ExchangeConfigArrProvider
  ],
  exports: [
    AssetModule,
    ExchangeService,
  ]
})
export class MarketModule {}
