import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MarketService } from './market.service';
import { MarketController } from './market.controller';
import { DBModule } from '../database/database.module';
import { Pm2Module } from 'src/pm2/pm2.module';

@Module({
  imports: [
    HttpModule.register({
      timeout: 90000,
    }),
    DBModule,
    Pm2Module
  ],
  controllers: [MarketController],
  providers: [MarketService],
  exports: [MarketService]
})
export class MarketModule {}
