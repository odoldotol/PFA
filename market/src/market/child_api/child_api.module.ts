import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from 'src/http/http.module';
import { TaskQueueModule } from 'src/taskQueue/taskQueue.module';
import { ConnectionService } from './connection.service';
import { ChildApiService } from './child_api.service';
import { ExchangeSessionApiService } from './exchangeSessionApi.service';
import { YfinanceApiService } from './yfinanceApi.service';
import { EnvKey } from 'src/common/enum/envKey.enum';
import { EnvironmentVariables } from 'src/common/interface';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (
        configService: ConfigService<EnvironmentVariables>
      ) => ({
        baseURL: configService.get(
          EnvKey.DOCKER_CHILD_API_BASE_URL,
          'http://127.0.0.1:8001',
          { infer: true }
        )!,
        timeout: configService.get(
          EnvKey.CHILD_API_TIMEOUT,
          30000,
          { infer: true }
        )!,
      }),
      inject: [ConfigService]
    }),
    TaskQueueModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (
        configService: ConfigService<EnvironmentVariables>
      ) => {
        const childWorkers = configService.get(
          EnvKey.CHILD_WORKERS,
          1,
          { infer: true }
        );
        const childConcurrency = configService.get(
          EnvKey.CHILD_CONCURRENCY,
          50,
          { infer: true }
        );

        const concurrency = childWorkers * childConcurrency;

        return {
          concurrency: concurrency,
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [
    ConnectionService,
    ChildApiService,
    ExchangeSessionApiService,
    YfinanceApiService,
  ],
  exports: [
    ExchangeSessionApiService,
    YfinanceApiService,
  ]
})
export class ChildApiModule {}
