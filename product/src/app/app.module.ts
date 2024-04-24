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
import { UpdaterModule } from 'src/updater';
import { KakaoChatbotModule } from 'src/kakaoChatbot';
import { DevModule } from 'src/dev';
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
    UpdaterModule,
    KakaoChatbotModule,
    DevModule
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
