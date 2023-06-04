import { DynamicModule, ExistingProvider, FactoryProvider, Module, ValueProvider } from "@nestjs/common";
import { ConnectService } from "./connect.service";
import { RedisService } from "./redis.service";
import { RedisRepository } from "./redis.repository";

@Module({})
export class RedisModule {
    // Todo: schema 만들기
    static register(schemaArr: Function[]): DynamicModule {

        const redisServiceAliasProvider: ExistingProvider<InMemoryStoreServiceI> = {
            provide: "INMEMORY_STORE_SERVICE",
            useExisting: RedisService,
        };

        const mockBackupService: ValueProvider<InMemoryStoreBackupServiceI> = {
            provide: "INMEMORY_STORE_BACKUP_SERVICE",
            useValue: {
                localFileCacheRecovery: () => Promise.resolve(),
            },
        };

        const schemaProviders: ValueProvider[] = schemaArr.map(schema => ({
            provide: schema.name,
            useValue: schema,
        }));

        const schemaRepositorys: FactoryProvider[] = schemaArr.map(schema => ({
            provide: schema.name+"REPOSITORY",
            useFactory(redisSrv: RedisService, schema: InMemorySchemaI) {
                return new RedisRepository(redisSrv, schema);
            },
            inject: [RedisService, schema.name],
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