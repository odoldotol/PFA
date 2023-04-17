import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { KakaoCBModule } from '@kakao-chatbot.module';
import { Pm2Module } from '@pm2.module';
import { DevModule } from '@dev.module';
import { HttpLoggerMiddleware } from './middleware/httpLogger.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env"}),
    ScheduleModule.forRoot(),
    Pm2Module,
    KakaoCBModule,
    DevModule]
})
export class AppModule implements NestModule {
  configure = (consumer: MiddlewareConsumer) => consumer.apply(HttpLoggerMiddleware).forRoutes('*');
}