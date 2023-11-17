import { EnvKey } from 'src/common/enum/envKey.enum';
import { EnvironmentVariables } from "src/common/interface/environmentVariables.interface";
import { readFileSync } from "fs";

export const production: EnvironmentVariables[EnvKey.TYPEORM_MODULE_OPTIONS] = {
  type: 'postgres',
  host: process.env.PG_HOST,
  port: 5432,
  username: process.env.PG_USERNAME,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
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

export const developmentDocker: EnvironmentVariables[EnvKey.TYPEORM_MODULE_OPTIONS] = {
  type: 'postgres',
  host: 'market-postgres',
  port: 5432,
  username: 'test',
  password: 'test',
  database: 'test',
  synchronize: true,
  autoLoadEntities: true
};

export const developmentLocal: EnvironmentVariables[EnvKey.TYPEORM_MODULE_OPTIONS] = {
  type: 'postgres',
  host: '127.0.0.1',
  port: 5432,
  username: 'test',
  password: 'test',
  database: 'test',
  synchronize: true,
  autoLoadEntities: true
};

export default ((): EnvironmentVariables[EnvKey.TYPEORM_MODULE_OPTIONS] => {
  if (process.env.RACK_ENV === 'production') return production;
  else if (process.env.RACK_ENV === 'development') return developmentDocker;
  else return developmentLocal;
})();