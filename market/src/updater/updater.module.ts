import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { UpdaterService } from './updater.service';
import { MarketModule } from '../market/market.module';
import { MongodbModule } from '../database/mongodb/mongodb.module';

@Module({
  imports: [
    MarketModule,
    HttpModule.register({
      timeout: 90000,
    }),
    MongodbModule
  ],
  providers: [UpdaterService],
  exports: [UpdaterService]
})
export class UpdaterModule {}
