import {
  MiddlewareConsumer,
  Module,
  NestModule,
  ValidationPipe
} from '@nestjs/common';
import {
  APP_INTERCEPTOR,
  APP_PIPE
} from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { Pm2Module } from 'src/pm2/pm2.module';
import { DevModule } from 'src/dev/dev.module';
import { UpdaterModule } from 'src/updater/updater.module';
import { DBModule } from 'src/database/database.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpLoggerMiddleware } from './middleware/httpLogger.middleware';
import {
  GlobalInterceptor,
  KeepAliveInterceptor
} from './interceptor';
import { globalValidationPipeOptions } from './const/globalValidationPipeOptions.const';
import { AppTerminator } from './app.terminator';
import mongoUriConfig from 'src/config/mongoUri.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
      load: [mongoUriConfig]
    }),
    ScheduleModule.forRoot(),
    Pm2Module,
    DevModule,
    UpdaterModule,
    DBModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
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
  ]
})
export class AppModule implements NestModule {
  configure (consumer: MiddlewareConsumer) {
    consumer
      .apply(HttpLoggerMiddleware)
      .forRoutes('*');
  }
}