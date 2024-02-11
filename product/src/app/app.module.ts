import {
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Pm2Module } from 'src/pm2/pm2.module';
import { RedisModule } from 'src/database/redis/redis.module';
import { PostgresModule } from 'src/database/postgres/postgres.module';
import { UpdaterModule } from 'src/updater/updater.module';
import { KakaoChatbotModule } from 'src/kakaoChatbot/kakaoChatbot.module';
import { DevModule } from 'src/dev/dev.module';
import { AppController } from './app.controller';
import { HttpLoggerMiddleware } from './middleware/httpLogger.middleware';
import { KeepAliveInterceptor } from './interceptor';
import {
  GlobalKeepAliveInterceptorProvider,
  GlobalValidationPipeProvider
} from './provider';
import { EnvKey } from 'src/common/enum/envKey.emun';
import { EnvironmentVariables } from 'src/common/interface';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env.product"
    }),
    Pm2Module,
    RedisModule.forRootAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: (
        configService: ConfigService<EnvironmentVariables>
      ) => ({
        url: configService.get(
          EnvKey.DOCKER_REDIS_URL,
          'redis://localhost:6379',
          { infer: true }
        )!,
      }),
      inject: [ConfigService],
    }),
    PostgresModule,
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
