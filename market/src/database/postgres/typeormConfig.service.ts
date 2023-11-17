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
    const typeOrmModuleOptions = this.configService.get(EnvKey.TYPEORM_MODULE_OPTIONS, { infer: true });
    if (typeOrmModuleOptions === undefined) throw new Error('TypeOrmModuleOptions is undefined');
    return typeOrmModuleOptions;
  }
}
