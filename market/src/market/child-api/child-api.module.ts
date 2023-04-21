import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { ChildApiService } from './child-api.service';

@Module({
    imports: [
        HttpModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                baseURL: configService.get('CHILD_API_BASE_URL') || 'http://localhost:8001',
                timeout: 30000,
            }),
            inject: [ConfigService]})],
    providers: [ChildApiService],
    exports: [ChildApiService]
})
export class ChildApiModule {}
