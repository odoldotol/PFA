import {
  MiddlewareConsumer,
  Module,
  NestModule,
  ValidationPipe
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KakaoCBModule } from 'src/kakao-chatbot/kakao-chatbot.module';
import { Pm2Module } from 'src/pm2/pm2.module';
import { DevModule } from 'src/dev/dev.module';
import { AppController } from './app.controller';
import { HttpLoggerMiddleware } from './middleware/httpLogger.middleware';
import {
  APP_INTERCEPTOR,
  APP_PIPE
} from '@nestjs/core';
import {
  GlobalInterceptor,
  KeepAliveInterceptor
} from './interceptor';
import { AppTerminator } from './app.terminator';
import { globalValidationPipeOptions } from './const/globalValidationPipeOptions.const';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env"
    }),
    Pm2Module,
    KakaoCBModule,
    DevModule
  ],
  controllers: [AppController],
  providers: [
    KeepAliveInterceptor,
    {
      provide: APP_INTERCEPTOR,
      useFactory: (interceptor: KeepAliveInterceptor) => new GlobalInterceptor(interceptor),
      inject: [KeepAliveInterceptor]
    },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe(globalValidationPipeOptions)
    },
    AppTerminator
  ],
})
export class AppModule implements NestModule {
  configure (consumer: MiddlewareConsumer) {
    consumer
      .apply(HttpLoggerMiddleware)
      .forRoutes('*');
  }
}