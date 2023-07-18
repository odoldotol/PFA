import { Module } from '@nestjs/common';
import { MarketService } from './market.service';
import { ChildApiModule } from './child-api/child-api.module';
import { ExchangeService } from './exchange.service';
import { ExchangeContainer } from './exchangeContainer';
import { ExchangeConfigArrProvider } from './provider/exchangeConfigArr.provider';

@Module({
  imports: [ChildApiModule],
  providers: [
    MarketService,
    ExchangeService,
    ExchangeContainer,
    ExchangeConfigArrProvider
  ],
  exports: [
    MarketService
  ]
})
export class MarketModule {}
