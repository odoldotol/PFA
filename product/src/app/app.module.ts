import {
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Pm2Module } from 'src/pm2/pm2.module';
import { PostgresModule } from 'src/database/postgres/postgres.module';
import { KakaoChatbotModule } from 'src/kakaoChatbot/kakaoChatbot.module';
import { DevModule } from 'src/dev/dev.module';
import { AppController } from './app.controller';
import { HttpLoggerMiddleware } from './middleware/httpLogger.middleware';
import { KeepAliveInterceptor } from './interceptor';
import {
  GlobalKeepAliveInterceptorProvider,
  GlobalValidationPipeProvider
} from './provider';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env.product"
    }),
    Pm2Module,
    PostgresModule,
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