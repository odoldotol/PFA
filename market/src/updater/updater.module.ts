import { Module } from '@nestjs/common';
import { UpdaterController } from './updater.controller';
import { UpdaterService } from './updater.service';

@Module({
  controllers: [UpdaterController],
  providers: [UpdaterService]
})
export class UpdaterModule {}
