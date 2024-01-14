import {
  DynamicModule,
  ExistingProvider,
  FactoryProvider,
  Module,
  ValueProvider
} from "@nestjs/common";
import { ConnectionService } from "./connect.service";
import { RedisService } from "./redis.service";
import { RedisRepository } from "./redis.repository";
import { InMemorySchema } from "../class/schema.class";
import {
  InMemoryBackupService,
  InMemoryStoreService
} from "../interface";
import {
  INMEMORY_STORE_SERVICE_TOKEN,
  INMEMORY_STORE_BACKUP_SERVICE_TOKEN,
  INMEMORY_SCHEMA_REPOSITORY_TOKEN_SUFFIX
} from "../const/injectionToken.const";

@Module({})
export class RedisModule {
  // Todo: schema 만들기
  static register(schemaArr: InMemorySchema[]): DynamicModule {

    const redisServiceAliasProvider: ExistingProvider<InMemoryStoreService> = {
      provide: INMEMORY_STORE_SERVICE_TOKEN,
      useExisting: RedisService,
    };

    const mockBackupService: ValueProvider<InMemoryBackupService> = {
      provide: INMEMORY_STORE_BACKUP_SERVICE_TOKEN,
      useValue: {
        localFileCacheRecovery: () => Promise.resolve(console.log("Noop")),
      },
    };

    const schemaProviders: ValueProvider[] = schemaArr.map(schema => ({
      provide: schema.name,
      useValue: schema,
    }));

    const schemaRepositorys: FactoryProvider[] = schemaArr.map(schema => ({
      provide: schema.name + INMEMORY_SCHEMA_REPOSITORY_TOKEN_SUFFIX,
      useFactory(redisSrv: RedisService, schema: InMemorySchema) {
        return new RedisRepository(redisSrv, schema);
      },
      inject: [INMEMORY_STORE_SERVICE_TOKEN, schema.name],
    }));

    return {
      module: RedisModule,
      providers: [
        ConnectionService,
        RedisService,
        redisServiceAliasProvider,
        mockBackupService,
        ...schemaProviders,
        ...schemaRepositorys,
      ],
      exports: [
        redisServiceAliasProvider,
        mockBackupService,
        ...schemaRepositorys,
      ]
    }
  }
}
