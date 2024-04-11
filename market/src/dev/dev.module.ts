import { Module } from '@nestjs/common';
import { DevController } from './dev.controller';
import { DevService } from './dev.service';
import {
  LogPriceUpdateModule,
  YfinanceInfoModule
} from 'src/database';
import { Market_ExchangeModule } from 'src/market';

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
