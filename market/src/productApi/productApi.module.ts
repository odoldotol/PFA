import { Module } from '@nestjs/common';
import { ProductApiConfigService } from 'src/config';
import { HttpModule } from 'src/http';
import { ProductApiService } from './productApi.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: ( // Todo: useClass 로 변경
        productApiConfigSrv: ProductApiConfigService
      ) => ({
        baseURL: productApiConfigSrv.getBaseUrl(),
        timeout: productApiConfigSrv.getTimeout(),
      }),
      inject: [ProductApiConfigService]
    })],
  providers: [ProductApiService],
  exports: [ProductApiService]
})
export class ProductApiModule {}
