import {
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { ConfigModule } from 'src/config';
import { Pm2Module } from 'src/pm2/pm2.module';
import {
  RedisModule,
  PostgresModule,
 } from 'src/database';
import { ThrottlerModule } from 'src/throttler';
import { KakaoChatbotModule } from 'src/kakaoChatbot';
import { AppController } from './app.controller';
import { HttpLoggerMiddleware } from './middleware';
import { KeepAliveInterceptor } from './interceptor';
import {
  GlobalKeepAliveInterceptorProvider,
  GlobalValidationPipeProvider
} from './provider';

@Module({
  imports: [
    ConfigModule,
    Pm2Module,
    RedisModule,
    PostgresModule,
    ThrottlerModule,
    KakaoChatbotModule,
  ],
  controllers: [AppController],
  providers: [
    KeepAliveInterceptor,
    GlobalKeepAliveInterceptorProvider,
    GlobalValidationPipeProvider
  ],
})
export class AppModule implements NestModule {
  configure (consumer: MiddlewareConsumer) {
    consumer
      .apply(HttpLoggerMiddleware)
      .forRoutes('*');
  }
}
