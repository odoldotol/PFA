import { Module } from '@nestjs/common';
import { HttpModule } from 'src/http/http.module';
import { TaskQueueModule } from 'src/taskQueue/taskQueue.module';
import { ConnectionService } from './connection.service';
import { ChildApiService } from './childApi.service';
import { ExchangeSessionApiService } from './exchangeSessionApi.service';
import { YfinanceApiService } from './yfinanceApi.service';
import { ChildApiConfigService } from 'src/config';

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: ( // Todo: useClass 로 변경
        childApiConfigSrv: ChildApiConfigService
      ) => ({
        baseURL: childApiConfigSrv.getBaseUrl(),
        timeout: childApiConfigSrv.getTimeout(),
      }),
      inject: [ChildApiConfigService]
    }),
    TaskQueueModule.registerAsync({
      useFactory: ( // Todo: useClass 로 변경
        childApiConfigSrv: ChildApiConfigService
      ) => ({
        concurrency: childApiConfigSrv.getConcurrency(),
      }),
      inject: [ChildApiConfigService],
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
