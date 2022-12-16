import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { UpdaterController } from './updater.controller';
import { UpdaterService } from './updater.service';
import { YahoofinanceModule } from 'src/yahoofinance/yahoofinance.module';
import { MongodbModule } from 'src/mongodb/mongodb.module';

@Module({
  imports: [
    YahoofinanceModule,
    HttpModule,
    MongodbModule
],
  controllers: [UpdaterController],
  providers: [UpdaterService]
})
export class UpdaterModule {}
