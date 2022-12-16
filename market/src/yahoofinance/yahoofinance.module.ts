import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { YahoofinanceService } from './yahoofinance.service';

@Module({
  imports: [HttpModule],
  providers: [YahoofinanceService],
  exports: [YahoofinanceService]
})
export class YahoofinanceModule {}
