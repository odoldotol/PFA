import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { UpdaterService } from './updater.service';
import { YahoofinanceModule } from '../yahoofinance/yahoofinance.module';
import { MongodbModule } from '../mongodb/mongodb.module';

@Module({
  imports: [
    YahoofinanceModule,
    HttpModule,
    MongodbModule
],
  providers: [UpdaterService],
  exports: [UpdaterService]
})
export class UpdaterModule {}
