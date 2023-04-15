import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { Pm2Module } from './pm2/pm2.module';
import { DevModule } from './dev/dev.module';
import { UpdaterModule } from './updater/updater.module';
import { DBModule } from './database/database.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpLoggerMiddleware } from './middleware/httpLogger.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env"}),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: `${configService.get('MONGO_URL')}${configService.get('MONGO_database')}${configService.get('MONGO_Query')}`
      }),
      inject: [ConfigService],}),
    ScheduleModule.forRoot(),
    Pm2Module,
    DevModule,
    UpdaterModule,
    DBModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');}}