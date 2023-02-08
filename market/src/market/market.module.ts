import { HttpModule } from '@nestjs/axios';
import { CacheModule, Module } from '@nestjs/common';
import { MarketService } from './market.service';
import { MongodbModule } from '../database/mongodb/mongodb.module';

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
  providers: [MarketService],
  exports: [MarketService]
})
export class MarketModule {}
