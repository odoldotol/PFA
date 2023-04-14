import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ManagerModule } from './manager/manager.module';
import { Pm2Module } from './pm2/pm2.module';
import { DevModule } from './dev/dev.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env"
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: `${configService.get('MONGO_URL')}${configService.get('MONGO_database')}${configService.get('MONGO_Query')}`
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    Pm2Module,
    ManagerModule,
    DevModule,
  ],
})
export class AppModule {}
