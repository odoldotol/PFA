import { Module } from '@nestjs/common';
import { UpdaterController } from './updater.controller';
import { UpdaterService } from './updater.service';
import { MarketModule } from 'src/market/market.module';
import { DatabaseModule } from 'src/database/database.module';
import { ProductApiModule } from 'src/product-api/product-api.module';

@Module({
  imports: [
    MarketModule,
    DatabaseModule,
    ProductApiModule
  ],
  controllers: [UpdaterController],
  providers: [UpdaterService],
  exports: [UpdaterService]
})
export class UpdaterModule {}
