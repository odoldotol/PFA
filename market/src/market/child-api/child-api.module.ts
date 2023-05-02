import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { ChildApiService } from './child-api.service';
import { EnvKey } from 'src/common/enum/envKey.emun';
import { EnvironmentVariables } from 'src/common/interface/environmentVariables.interface';

@Module({
    imports: [
        HttpModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService<EnvironmentVariables>) => ({
                baseURL: configService.get(EnvKey.Docker_childApiBaseUrl, 'http://localhost:8001', { infer: true }),
                timeout: configService.get(EnvKey.ChildApiTimeout, 30000, { infer: true }),
            }),
            inject: [ConfigService]})],
    providers: [ChildApiService],
    exports: [ChildApiService]
})
export class ChildApiModule {}
