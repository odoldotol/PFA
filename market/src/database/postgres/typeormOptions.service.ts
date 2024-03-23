import { Injectable } from "@nestjs/common";
import {
  TypeOrmModuleOptions,
  TypeOrmOptionsFactory
} from "@nestjs/typeorm";
import {
  AppConfigService,
  PostgresConfigService
} from "src/config";
import { readFileSync } from "fs";

@Injectable()
export class TypeOrmOptionsService
  implements TypeOrmOptionsFactory
{
  constructor(
    private readonly appConfigSrv: AppConfigService,
    private readonly postgresConfigSrv: PostgresConfigService,
  ) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    if (this.appConfigSrv.isProduction()) {
      return this.getProductionOptions();
    } else {
      return this.getDevelopmentOptions(this.appConfigSrv.isDockerDevelopment());
    }
  }

  private getProductionOptions(): TypeOrmModuleOptions {
    return {
      ...this.postgresConfigSrv.getConnectOptions(),
      type: 'postgres',
      port: 5432,
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
  }

  private getDevelopmentOptions(isDockerDev: boolean): TypeOrmModuleOptions {

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

    return isDockerDev ? developmentDocker : developmentLocal;
  }
}
