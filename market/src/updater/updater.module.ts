import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { UpdaterController } from './updater.controller';
import { UpdaterService } from './updater.service';
import { MarketModule } from '@market.module';
import { DBModule } from '@database.module';
import { ProductApiModule } from '@product-api.module';

@Module({
  imports: [
    MarketModule,
    DBModule,
    ProductApiModule],
  controllers: [UpdaterController],
  providers: [UpdaterService],
  exports: [UpdaterService]
})
export class UpdaterModule {}
