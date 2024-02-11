import { Module } from '@nestjs/common';
import { MarketDateModule } from 'src/database/marketDate/marketDate.module';
import { DevController } from './dev.controller';
import { DevService } from './dev.service';

@Module({
  imports: [
    MarketDateModule,
  ],
  controllers: [DevController],
  providers: [DevService]
})
export class DevModule {}
