import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class MongodbConfigService {

  constructor(
    private readonly configSrv: ConfigService,
  ) {}

  public getAtlasUri() {
    const url = this.configSrv.get<string>("MONGO_URL", { infer: true });
    const databaseName = this.configSrv.get<string>("MONGO_database", { infer: true });
    const query = this.configSrv.get<string>("MONGO_Query", { infer: true });

    if (
      url === undefined ||
      databaseName === undefined ||
      query === undefined
    ) {
      throw new Error('MongoDB Atlas URI is not provided');
    }

    return url + databaseName + query;
  }

}
