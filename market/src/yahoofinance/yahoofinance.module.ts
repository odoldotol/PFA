import { HttpModule } from '@nestjs/axios';
import { CacheModule, Module } from '@nestjs/common';
import { YahoofinanceService } from './yahoofinance.service';
import { MongodbModule } from '../mongodb/mongodb.module';

@Module({
  imports: [
    CacheModule.register({
      ttl: 0,
    }),
    MongodbModule,
    HttpModule.register({
      timeout: 90000,
    }),
  ],
  providers: [YahoofinanceService],
  exports: [YahoofinanceService]
})
export class YahoofinanceModule {}
