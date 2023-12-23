import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from 'src/http/http.module';
import { ConnectionService } from './connection.service';
import { ChildApiService } from './child_api.service';
import { EnvKey } from 'src/common/enum/envKey.enum';
import { EnvironmentVariables } from 'src/common/interface';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (
        configService: ConfigService<EnvironmentVariables>
      ) => ({
        baseURL: configService.get(
          EnvKey.DOCKER_CHILD_API_BASE_URL,
          'http://127.0.0.1:8001',
          { infer: true }
        )!,
        timeout: configService.get(
          EnvKey.CHILD_API_TIMEOUT,
          30000,
          { infer: true }
        )!,
      }),
      inject: [ConfigService]
    })
  ],
  providers: [
    ConnectionService,
    ChildApiService
  ],
  exports: [ChildApiService]
})
export class ChildApiModule {}
