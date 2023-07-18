import { Module } from '@nestjs/common';
import { UpdaterController } from './updater.controller';
import { UpdaterService } from './updater.service';
import { MarketModule } from 'src/market/market.module';
import { DBModule } from 'src/database/database.module';
import { ProductApiModule } from 'src/product-api/product-api.module';
import { UpdaterSchedulerService } from './scheduler.service';
import { ExchangeService } from './exchange.service';

@Module({
  imports: [
    MarketModule,
    DBModule,
    ProductApiModule
  ],
  controllers: [UpdaterController],
  providers: [
    UpdaterService,
    ExchangeService,
    UpdaterSchedulerService,
  ],
  exports: [UpdaterService]
})
export class UpdaterModule {}
