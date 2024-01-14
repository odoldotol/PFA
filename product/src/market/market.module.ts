import { Module } from '@nestjs/common';
import { MarketService } from './market.service';
import { MarketController } from './market.controller';
import { DBModule } from '../database/database.module';
import { Pm2Module } from 'src/pm2/pm2.module';
import { MarketApiModule } from './market-api/market-api.module';

@Module({
  imports: [
    MarketApiModule,
    DBModule,
    Pm2Module
  ],
  controllers: [MarketController],
  providers: [MarketService],
  exports: [MarketService]
})
export class MarketModule {}
