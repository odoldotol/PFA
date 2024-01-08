import { Module } from '@nestjs/common';
import { DevController } from './dev.controller';
import { DevService } from './dev.service';
import { LogPriceUpdateModule } from 'src/database/log_priceUpdate/log_priceUpdate.module';
import { YfinanceInfoModule } from 'src/database/yf_info/yf_info.module';
import { Market_ExchangeModule } from 'src/market/exchange/exchange.module';

@Module({
  imports: [
    LogPriceUpdateModule,
    YfinanceInfoModule,
    Market_ExchangeModule
  ],
  controllers: [DevController],
  providers: [DevService],
})
export class DevModule {}
