import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from 'src/http/http.module';
import { ConnectionService } from './connection.service';
import { MarketApiService } from './marketApi.service';
import { EnvironmentVariables } from 'src/common/interface/environmentVariables.interface';
import { EnvKey } from 'src/common/enum/envKey.emun';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (
        configService: ConfigService<EnvironmentVariables>
      ) => ({
        baseURL: configService.get(
          EnvKey.DOCKER_MARKET_API_BASE_URL,
          'http://localhost:6001',
          { infer: true }
        )!,
        timeout: configService.get(
          EnvKey.MARKET_API_TIMEOUT,
          10000,
          { infer: true }
        )!,
      }),
      inject: [ConfigService]
    }),
  ],
  providers: [
    ConnectionService,
    MarketApiService
  ],
  exports: [MarketApiService]
})
export class MarketApiModule {}
