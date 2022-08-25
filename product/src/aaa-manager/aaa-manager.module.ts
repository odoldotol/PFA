import { Module } from '@nestjs/common';
import { AaaManagerController } from './aaa-manager.controller';
import { AaaManagerService } from './aaa-manager.service';

@Module({
  controllers: [AaaManagerController],
  providers: [AaaManagerService]
})
export class AaaManagerModule {}
