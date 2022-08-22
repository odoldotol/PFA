import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app/app.controller';
import { AppService } from './app/app.service';

import { ManagerModule } from './manager/manager.module';
import { UpdaterModule } from './updater/updater.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env.development.local"
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: `${configService.get('MONGO_URL')}${configService.get('MONGO_database')}${configService.get('MONGO_Query')}`
      }),
      inject: [ConfigService],
    }),
    ManagerModule, // market data 에 대한 CRUD 가 주 목적
    UpdaterModule // market data 를 의미있게 사용하기 위한 지속적인 업데이트가 목적
  ], 
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
