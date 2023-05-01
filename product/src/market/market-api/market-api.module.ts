import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { MarketApiService } from './market-api.service';
import { EnvironmentVariables } from 'src/common/interface/environmentVariables.interface';
import { EnvKey } from 'src/common/enum/envKey.emun';

@Module({
  imports: [
    HttpModule.registerAsync({
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService<EnvironmentVariables>) => ({
            baseURL: configService.get(EnvKey.Docker_marketApiBaseUrl, 'http://localhost:6001'),
            timeout: configService.get(EnvKey.MarketApiTimeout, 10000)
        }),
        inject: [ConfigService]})],
  providers: [MarketApiService],
  exports: [MarketApiService]
})
export class MarketApiModule {}
