import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { YahoofinanceService } from './yahoofinance.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 90000,
    }),
  ],
  providers: [YahoofinanceService],
  exports: [YahoofinanceService]
})
export class YahoofinanceModule {}
