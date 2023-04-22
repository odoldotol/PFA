import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { MarketApiService } from './market-api.service';

@Module({
  imports: [
    HttpModule.registerAsync({
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
            baseURL: configService.get('MARKET_API_BASE_URL', 'http://localhost:6001'),
            timeout: 10000,
        }),
        inject: [ConfigService]})],
  providers: [MarketApiService],
  exports: [MarketApiService]
})
export class MarketApiModule {}
