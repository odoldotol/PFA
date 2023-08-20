import { Module } from '@nestjs/common';
import { DevController } from './dev.controller';
import { DevService } from './dev.service';
import { DatabaseModule } from 'src/database/database.module';
import { MarketModule } from 'src/market/market.module';

@Module({
  imports: [
    DatabaseModule,
    MarketModule
  ],
  controllers: [DevController],
  providers: [DevService],
})
export class DevModule {}
