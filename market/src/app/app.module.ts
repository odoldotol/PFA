import {
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { ConfigModule } from 'src/config/config.module';
import { Pm2Module } from 'src/pm2/pm2.module';
import { MongodbModule } from 'src/database/mongodb/mongodb.module';
import { PostgresModule } from 'src/database/postgres/postgres.module';
import { DevModule } from 'src/dev/dev.module';
import { UpdaterModule } from 'src/updater/updater.module';
import { AppController } from './app.controller';
import { HttpLoggerMiddleware } from './middleware/httpLogger.middleware';
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