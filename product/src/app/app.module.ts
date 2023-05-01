import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { KakaoCBModule } from 'src/kakao-chatbot/kakao-chatbot.module';
import { Pm2Module } from 'src/pm2/pm2.module';
import { DevModule } from 'src/dev/dev.module';
import { AppController } from './app.controller';
import { HttpLoggerMiddleware } from './middleware/httpLogger.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env"}),
    ScheduleModule.forRoot(),
    Pm2Module,
    KakaoCBModule,
    DevModule],
  controllers: [AppController]
})
export class AppModule implements NestModule {
  configure = (consumer: MiddlewareConsumer) => consumer.apply(HttpLoggerMiddleware).forRoutes('*');
}