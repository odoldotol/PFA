import {
  DynamicModule,
  FactoryProvider,
  Module,
  ValueProvider
} from "@nestjs/common";
import {
  ASYNC_OPTIONS_TYPE,
  ConfigurableModuleClass,
} from "./redis.module-definition";
import { ConnectionService } from "./connection.service";
import { RedisService } from "./redis.service";
import { SchemaService } from "./schema.service";
import { Repository } from "./redis.repository";
import {
  REDIS_CLIENT_TOKEN,
  REDIS_REPOSITORY_TOKEN_SUFFIX,
  REIDS_SCHEMA_SERVICE_TOKEN_SUFFIX
} from "src/common/const/injectionToken.const";
import { RedisModel } from "../interface";
import { RedisConfigService } from "src/config";

@Module({})
export class RedisRootModule
  extends ConfigurableModuleClass
{
  static forRootAsync(
    options: typeof ASYNC_OPTIONS_TYPE
  ): DynamicModule {

    const dynamicModule = super.forRootAsync(options);

    const redisClientProvider: FactoryProvider = {
      provide: REDIS_CLIENT_TOKEN,
      useFactory: (connectService: ConnectionService) => {
        return connectService.connect();
      },
      inject: [ConnectionService]
    };

    dynamicModule.providers!.push(
      ConnectionService,
      redisClientProvider,
      RedisService,
    );

    dynamicModule.exports ||
    (dynamicModule.exports = []);
    dynamicModule.exports?.push(REDIS_CLIENT_TOKEN, RedisService);

    return dynamicModule;
  }
}

@Module({
  // Todo
  imports: [RedisRootModule.forRootAsync({
    isGlobal: true,
    useFactory: (
      redisConfigSrv: RedisConfigService
    ) => ({
      url: redisConfigSrv.getUrl(),
    }),
    inject: [RedisConfigService],
  })]
})
export class RedisModule {

  static forFeature(
    models: RedisModel[]
  ): DynamicModule {

    const modelProviders
    : ValueProvider<RedisModel>[]
    = models.map(model => ({
      provide: model.schema.name, //
      useValue: model,
    }));

    const schemaServices
    : FactoryProvider<SchemaService>[]
    = models.map(model => ({
      provide: model.schema.name + REIDS_SCHEMA_SERVICE_TOKEN_SUFFIX,
      useFactory(
        redisSrv: RedisService,
        model: RedisModel
      ) {
        return new SchemaService(
          redisSrv,
          model
        );
      },
      inject: [
        RedisService,
        model.schema.name //
      ],
    }));

    const schemaRepositorys
    : FactoryProvider<Repository>[]
    = models.map(model => ({
      provide: model.schema.name + REDIS_REPOSITORY_TOKEN_SUFFIX, //
      useFactory(
        redisSrv: RedisService,
        schemaSrv: SchemaService
      ) {
        return new Repository(
          redisSrv,
          schemaSrv
        );
      },
      inject: [
        RedisService,
        model.schema.name + REIDS_SCHEMA_SERVICE_TOKEN_SUFFIX //
      ],
    }));

    return {
      module: RedisModule,
      providers: [
        ...modelProviders,
        ...schemaServices,
        ...schemaRepositorys,
      ],
      exports: [
        ...schemaRepositorys
      ],
    };
  }
}
