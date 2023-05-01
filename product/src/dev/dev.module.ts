import { Module } from '@nestjs/common';
import { DevController } from './dev.controller';
import { DevService } from './dev.service';
import { DBModule } from 'src/database/database.module';
import { MarketModule } from 'src/market/market.module';

@Module({
  imports: [
    DBModule,
    MarketModule,],
  controllers: [DevController],
  providers: [DevService]
})
export class DevModule {}
