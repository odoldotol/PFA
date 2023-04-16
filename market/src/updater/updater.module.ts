import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { UpdaterController } from './updater.controller';
import { UpdaterService } from './updater.service';
import { MarketModule } from '@market.module';
import { DBModule } from '@database.module';

@Module({
  imports: [
    MarketModule,
    DBModule,
    HttpModule.register({
      timeout: 90000,
    }),
  ],
  controllers: [UpdaterController],
  providers: [UpdaterService],
  exports: [UpdaterService]
})
export class UpdaterModule {}
