import { Module } from '@nestjs/common';
import { HttpModule } from 'src/http';
import { ConnectionService } from './connection.service';
import { MarketApiConfigService } from 'src/config';
import { MarketApiService } from './marketApi.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: (
        marketApiConfigSrv: MarketApiConfigService
      ) => ({
        baseURL: marketApiConfigSrv.getBaseUrl(),
        timeout: marketApiConfigSrv.getTimeout(),
      }),
      inject: [MarketApiConfigService]
    }),
  ],
  providers: [
    ConnectionService,
    MarketApiService
  ],
  exports: [MarketApiService]
})
export class MarketApiModule {}
