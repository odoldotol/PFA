import {
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Pm2Module } from 'src/pm2/pm2.module';
import { DevModule } from 'src/dev/dev.module';
import { UpdaterModule } from 'src/updater/updater.module';
import { DatabaseModule } from 'src/database/database.module';
import { AssetModule } from 'src/asset/asset.module';
import { AppController } from './app.controller';
import { HttpLoggerMiddleware } from './middleware/httpLogger.middleware';
import { KeepAliveInterceptor } from './interceptor';
import { AppTerminator } from './app.terminator';
import mongoUriConfig from 'src/config/mongoUri.config';
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
      ]
    }),
    Pm2Module,
    DevModule,
    UpdaterModule,
    DatabaseModule,
    AssetModule
  ],
  controllers: [AppController],
  providers: [
    KeepAliveInterceptor, //
    GlobalKeepAliveInterceptorProvider, // Todo: 왜 불필요하게 한번 꼬아서 등록했어?
    GlobalValidationPipeProvider,
    AppTerminator // Todo: 여기 있으면 안됨.
  ]
})
export class AppModule implements NestModule {
  configure (consumer: MiddlewareConsumer) {
    consumer
    .apply(HttpLoggerMiddleware)
    .forRoutes('*');
  }
}