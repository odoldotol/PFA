import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { UpdaterService } from './updater.service';
import { MarketModule } from '../market/market.module';
import { DBModule } from '../database/database.module';

@Module({
  imports: [
    MarketModule,
    DBModule,
    HttpModule.register({
      timeout: 90000,
    }),
  ],
  providers: [UpdaterService],
  exports: [UpdaterService]
})
export class UpdaterModule {}
