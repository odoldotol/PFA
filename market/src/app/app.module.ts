import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
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


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env"}),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService<EnvironmentVariables>) => ({
        uri: `${configService.get(EnvKey.MongoDB_url)}${configService.get(EnvKey.MongoDB_name)}${configService.get(EnvKey.MongoDB_query)}`
      }),
      inject: [ConfigService],}),
    ScheduleModule.forRoot(),
    Pm2Module,
    DevModule,
    UpdaterModule,
    DBModule,],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule implements NestModule {
  configure = (consumer: MiddlewareConsumer) => consumer.apply(HttpLoggerMiddleware).forRoutes('*');
}