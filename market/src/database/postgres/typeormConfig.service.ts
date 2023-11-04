import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm";
import { EnvironmentVariables } from 'src/common/interface/environmentVariables.interface';
import { EnvKey } from 'src/common/enum/envKey.enum';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>
  ) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.configService.get(EnvKey.PgHost),
      port: 5432,
      username: this.configService.get(EnvKey.PgUsername),
      password: this.configService.get(EnvKey.PgPassword),
      database: this.configService.get(EnvKey.PgDatabase),
      autoLoadEntities: true,
      synchronize: this.configService.get(EnvKey.Docker_env) === 'production' ? false : true,
    };
  }
}