import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from 'src/common/interface/environmentVariables.interface';
import { EnvKey } from 'src/common/enum/envKey.emun';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService<EnvironmentVariables>) => ({
        uri: configService.get(EnvKey.MONGODB_URI),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class MongoModule {}
