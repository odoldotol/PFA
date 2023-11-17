import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm";
import { EnvironmentVariables } from 'src/common/interface/environmentVariables.interface';
import { EnvKey } from 'src/common/enum/envKey.enum';
import { readFileSync } from "fs";

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>
  ) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {

    const production: TypeOrmModuleOptions = {
      type: 'postgres',
      host: this.configService.get(EnvKey.PgHost),
      port: 5432,
      username: this.configService.get(EnvKey.PgUsername),
      password: this.configService.get(EnvKey.PgPassword),
      database: this.configService.get(EnvKey.PgDatabase),
      synchronize: false,
      autoLoadEntities: true,
      /* Todo: RDS 프록시 사용해보기
      Amazon RDS 프록시는 AWS Certificate Manager(ACM)의 인증서를 사용합니다.
      RDS Proxy를 사용하는 경우 Amazon RDS 인증서를 다운로드하거나 RDS Proxy 연결을 사용하는 애플리케이션을 업데이트할 필요가 없습니다.
      RDS Proxy에서 TLS/SSL을 사용하는 방법에 대한 자세한 내용은 'RDS Proxy에서 TLS/SSL 사용'(아래링크)을 참조하십시오.
      https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/rds-proxy.howitworks.html#rds-proxy-security.tls
      */
      ssl: {
        ca: readFileSync("src/../aws-rds.pem")
      },
      extra: {
        ssl: {
          rejectUnauthorized: false,
        },
      },
    };
    
    const developmentDocker: TypeOrmModuleOptions = {
      type: 'postgres',
      host: 'market-postgres',
      port: 5432,
      username: 'test',
      password: 'test',
      database: 'test',
      synchronize: true,
      autoLoadEntities: true
    };
    
    const developmentLocal: TypeOrmModuleOptions = {
      type: 'postgres',
      host: '127.0.0.1',
      port: 5432,
      username: 'test',
      password: 'test',
      database: 'test',
      synchronize: true,
      autoLoadEntities: true
    };

    if (this.configService.get(EnvKey.Docker_env) === 'production') return production;
    else if (this.configService.get(EnvKey.Docker_env) === 'development') return developmentDocker;
    else return developmentLocal;
  }

}
