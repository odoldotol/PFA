import {
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { ConfigModule } from 'src/config';
import { Pm2Module } from 'src/pm2/pm2.module';
import {
  MongodbModule,
  PostgresModule
} from 'src/database';
import { ThrottlerModule } from 'src/throttler';
import { DevModule } from 'src/dev';
import { UpdaterModule } from 'src/updater';
import { AppController } from './app.controller';
import { HttpLoggerMiddleware } from './middleware';
import { KeepAliveInterceptor } from './interceptor';
import {
  GlobalValidationPipeProvider,
  GlobalKeepAliveInterceptorProvider
} from './provider';

@Module({
  imports: [
    ConfigModule,
    Pm2Module,
    MongodbModule,
    PostgresModule,
    ThrottlerModule,
    DevModule,
    UpdaterModule,
  ],
  controllers: [AppController],
  providers: [
    KeepAliveInterceptor,
    GlobalKeepAliveInterceptorProvider,
    GlobalValidationPipeProvider
  ]
})
export class AppModule implements NestModule {
  configure (consumer: MiddlewareConsumer) {
    consumer
    .apply(HttpLoggerMiddleware)
    .forRoutes('*');
  }
}