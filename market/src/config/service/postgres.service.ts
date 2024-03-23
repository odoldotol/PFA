import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PostgresConnectionCredentialsOptions } from "typeorm/driver/postgres/PostgresConnectionCredentialsOptions";
import { PostgresEnvKey } from "../enum";
import { PostgresEnvironmentVariables } from "../interface";

@Injectable()
export class PostgresConfigService {

  constructor(
    private readonly configSrv: ConfigService<PostgresEnvironmentVariables>,
  ) {}

  public getConnectOptions(): PostgresConnectionCredentialsOptions {
    const host = this.configSrv.get(PostgresEnvKey.HOST, { infer: true });
    const username = this.configSrv.get(PostgresEnvKey.USERNAME, { infer: true });
    const password = this.configSrv.get(PostgresEnvKey.PASSWORD, { infer: true });
    const database = this.configSrv.get(PostgresEnvKey.DATABASE, { infer: true });

    if (
      host === undefined ||
      username === undefined ||
      password === undefined ||
      database === undefined
    ) {
      throw new Error('Postgres Connection Options are not provided');
    }

    return {
      host,
      username,
      password,
      database
    };
  }

}
