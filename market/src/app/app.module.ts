import { MiddlewareConsumer, Module, NestModule, ValidationPipe } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { Pm2Module } from 'src/pm2/pm2.module';
import { DevModule } from 'src/dev/dev.module';
import { UpdaterModule } from 'src/updater/updater.module';
import { DBModule } from 'src/database/database.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpLoggerMiddleware } from './middleware/httpLogger.middleware';
import { EnvKey } from 'src/common/enum/envKey.emun'
import { EnvironmentVariables } from 'src/common/interface/environmentVariables.interface';
import { KeepAliveInterceptor } from 'src/app/intercepter/keepAlive.intercepter';
import GlobalValidationPipeOptions from './const/globalValidationPipeOptions.const';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env"
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService<EnvironmentVariables>) => ({
        uri: configService.get(EnvKey.Docker_env) === 'development' ?
          'mongodb://market-mongo:27017' :
          process.env.MONGO_ENV === 'test' ?
          'mongodb://localhost:27017' :
          `${configService.get(EnvKey.MongoDB_url)}${configService.get(EnvKey.MongoDB_name)}${configService.get(EnvKey.MongoDB_query)}`
      }),
      inject: [ConfigService],
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
    {
      provide: APP_INTERCEPTOR,
      useClass: KeepAliveInterceptor
    },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe(GlobalValidationPipeOptions)
    }
  ]
})
export class AppModule implements NestModule {
  configure = (consumer: MiddlewareConsumer) => consumer.apply(HttpLoggerMiddleware).forRoutes('*');
}