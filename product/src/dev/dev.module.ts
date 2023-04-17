import { Module } from '@nestjs/common';
import { DevController } from './dev.controller';
import { DevService } from './dev.service';
import { DBModule } from '@database.module';
import { MarketModule } from '@market.module';

@Module({
  imports: [
    DBModule,
    MarketModule,],
  controllers: [DevController],
  providers: [DevService]
})
export class DevModule {}
