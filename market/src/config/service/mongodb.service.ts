import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  MongodbEnvKey,
  MongoDevEnv
} from "../enum";
import { MongodbEnvironmentVariables } from "../interface";

@Injectable()
export class MongodbConfigService {

  constructor(
    private readonly configSrv: ConfigService<MongodbEnvironmentVariables>,
  ) {}

  public getAtlasUri() {
    const url = this.configSrv.get(MongodbEnvKey.URL, { infer: true });
    const databaseName = this.configSrv.get(MongodbEnvKey.NAME, { infer: true });
    const query = this.configSrv.get(MongodbEnvKey.QUERY, { infer: true });

    if (
      url === undefined ||
      databaseName === undefined ||
      query === undefined
    ) {
      throw new Error('MongoDB Atlas URI is not provided');
    }

    return url + databaseName + query;
  }

  public isDevAtlas(): boolean {
    return this.getDevEnv() === MongoDevEnv.ATLAS;
  }

  public isDevLocal(): boolean {
    return this.getDevEnv() === MongoDevEnv.LOCAL;
  }

  private getDevEnv(): MongoDevEnv | undefined {
    return this.configSrv.get(MongodbEnvKey.DEV_ENV, { infer: true });
  }
}
