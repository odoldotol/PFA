import {
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { Pm2Module } from 'src/pm2/pm2.module';
import { DevModule } from 'src/dev/dev.module';
import { UpdaterModule } from 'src/updater/updater.module';
import { DBModule } from 'src/database/database.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpLoggerMiddleware } from './middleware/httpLogger.middleware';
import { KeepAliveInterceptor } from './interceptor';
import { AppTerminator } from './app.terminator';
import mongoUriConfig from 'src/config/mongoUri.config';
import postgresConfig from 'src/config/postgres.config';
import {
  GlobalValidationPipeProvider,
  GlobalKeepAliveInterceptorProvider
} from './provider';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
      load: [
        mongoUriConfig,
        postgresConfig
      ]
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
    GlobalKeepAliveInterceptorProvider,
    GlobalValidationPipeProvider,
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