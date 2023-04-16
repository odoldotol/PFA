import { Module } from '@nestjs/common';
import { DevController } from './dev.controller';
import { DevService } from './dev.service';
import { DBModule } from '@database.module';

@Module({
  imports: [DBModule],
  controllers: [DevController],
  providers: [DevService]
})
export class DevModule {}
