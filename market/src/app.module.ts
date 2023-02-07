import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
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
    ScheduleModule.forRoot(),
    ManagerModule,
    UpdaterModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
