import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProductApiService } from './product_api.service';
import { EnvKey } from 'src/common/enum/envKey.enum';
import { EnvironmentVariables } from 'src/common/interface/environmentVariables.interface';
import { HttpModule } from 'src/http/http.module';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService<EnvironmentVariables>) => ({
        baseURL: configService.get(EnvKey.Docker_productApiBaseUrl, 'http://localhost:7001', { infer: true }),
        timeout: configService.get(EnvKey.ProductApiTimeout, 10000, { infer: true }),
      }),
      inject: [ConfigService]
    })],
  providers: [
    ProductApiService
  ],
  exports: [ProductApiService]
})
export class ProductApiModule {}
