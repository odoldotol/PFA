import { DynamicModule, ExistingProvider, FactoryProvider, Module, ValueProvider } from "@nestjs/common";
import { ConnectService } from "./connect.service";
import { RedisService } from "./redis.service";
import { RedisRepository } from "./redis.repository";
import { InMemorySchema } from "../class/schema.class";
import { INMEMORY_STORE_SERVICE, INMEMORY_STORE_BACKUP_SERVICE, INMEMORY_SCHEMA_REPOSITORY_SUFFIX } from "../const/injectionToken.const";

@Module({})
export class RedisModule {
    // Todo: schema 만들기
    static register(schemaArr: InMemorySchema[]): DynamicModule {

        const redisServiceAliasProvider: ExistingProvider<InMemoryStoreServiceI> = {
            provide: INMEMORY_STORE_SERVICE,
            useExisting: RedisService,
        };

        const mockBackupService: ValueProvider<InMemoryStoreBackupServiceI> = {
            provide: INMEMORY_STORE_BACKUP_SERVICE,
            useValue: {
                localFileCacheRecovery: () => Promise.resolve(console.log("Noop")),
            },
        };

        const schemaProviders: ValueProvider[] = schemaArr.map(schema => ({
            provide: schema.name,
            useValue: schema,
        }));

        const schemaRepositorys: FactoryProvider[] = schemaArr.map(schema => ({
            provide: schema.name + INMEMORY_SCHEMA_REPOSITORY_SUFFIX,
            useFactory(redisSrv: RedisService, schema: InMemorySchema) {
                return new RedisRepository(redisSrv, schema);
            },
            inject: [INMEMORY_STORE_SERVICE, schema.name],
        }));

        return {
            module: RedisModule,
            providers: [
                ConnectService,
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