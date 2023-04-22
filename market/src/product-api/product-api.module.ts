import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { ProductApiService } from './product-api.service';

@Module({
    imports: [
        HttpModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                baseURL: configService.get('PRODUCT_API_BASE_URL') || 'http://localhost:7001',
                timeout: 10000,
            }),
            inject: [ConfigService]})],
    providers: [ProductApiService],
    exports: [ProductApiService]
})
export class ProductApiModule {}
