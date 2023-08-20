import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { ProductApiService } from './product_api.service';
import { EnvKey } from 'src/common/enum/envKey.emun';
import { EnvironmentVariables } from 'src/common/interface/environmentVariables.interface';

@Module({
    imports: [
        HttpModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService<EnvironmentVariables>) => ({
                baseURL: configService.get(EnvKey.Docker_productApiBaseUrl, 'http://localhost:7001', { infer: true }),
                timeout: configService.get(EnvKey.ProductApiTimeout, 10000, { infer: true }),
            }),
            inject: [ConfigService]})],
    providers: [ProductApiService],
    exports: [ProductApiService]
})
export class ProductApiModule {}
