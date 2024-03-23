import { Injectable } from "@nestjs/common";
import {
  MongooseModuleOptions,
  MongooseOptionsFactory
} from "@nestjs/mongoose";
import {
  AppConfigService,
  MongodbConfigService
} from "src/config";

@Injectable()
export class MongooseOptionsService
  implements MongooseOptionsFactory
{
  private readonly DOCLKER_DEV_URI = 'mongodb://market-mongo:27017';
  private readonly LOCAL_DEV_URI = 'mongodb://127.0.0.1:27017';

  constructor(
    private readonly AppConfigSrv: AppConfigService,
    private readonly mongodbConfigSrv: MongodbConfigService,
  ) {}

  createMongooseOptions(): MongooseModuleOptions {
    if (this.AppConfigSrv.isProduction()) {
      return this.getProductionOptions();
    } else if (this.AppConfigSrv.isDockerDevelopment()) {
      return this.getDockerDevOptions();
    } else {
      return this.getLocalDevOptions();
    }
  }

  private getProductionOptions(): MongooseModuleOptions {
    return {
      uri: this.mongodbConfigSrv.getAtlasUri(),
    };
  }

  private getDockerDevOptions(): MongooseModuleOptions {
    return {
      uri: this.DOCLKER_DEV_URI,
    };
  }

  private getLocalDevOptions(): MongooseModuleOptions {
    return {
      uri: this.getLocalDevUri(),
    };
  }

  private getLocalDevUri(): string {
    if (this.mongodbConfigSrv.isDevAtlas()) {
      return this.mongodbConfigSrv.getAtlasUri();
    } else if (this.mongodbConfigSrv.isDevLocal()) {
      return this.LOCAL_DEV_URI;
    } else {
      throw new Error('MongoDB URI Cannot be determined');
    }
  }
}

