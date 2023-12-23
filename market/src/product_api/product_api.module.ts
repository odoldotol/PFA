import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from 'src/http/http.module';
import { ProductApiService } from './product_api.service';
import { EnvironmentVariables } from 'src/common/interface';
import { EnvKey } from 'src/common/enum';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (
        configService: ConfigService<EnvironmentVariables>
      ) => ({
        baseURL: configService.get(
          EnvKey.DOCKER_PRODUCT_API_BASE_URL,
          'http://localhost:7001',
          { infer: true }
        )!,
        timeout: configService.get(
          EnvKey.PRODUCT_API_TIMEOUT,
          10000,
          { infer: true }
        )!,
      }),
      inject: [ConfigService]
    })],
  providers: [
    ProductApiService
  ],
  exports: [ProductApiService]
})
export class ProductApiModule {}
