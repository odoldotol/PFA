import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ManagerModule } from './manager/manager.module';
import { UpdaterModule } from './updater/updater.module';

@Module({
  imports: [
    ManagerModule, // market data 에 대한 CRUD 가 주 목적
    UpdaterModule // market data 를 의미있게 사용하기 위한 지속적인 업데이트가 목적
  ], 
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
