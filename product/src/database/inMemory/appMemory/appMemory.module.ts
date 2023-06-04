import { CacheModule, DynamicModule, Module, ValueProvider, FactoryProvider, ExistingProvider } from "@nestjs/common";
import { Pm2Module } from "src/pm2/pm2.module";
import { AppMemoryService } from "./appMemory.service";
import { BackupService } from "./backup.service";
import { AppMemoryRepository } from "./appMemory.repository";
import { INMEMORY_STORE_SERVICE, INMEMORY_STORE_BACKUP_SERVICE, INMEMORY_SCHEMA_REPOSITORY_SUFFIX } from "../const/injectionToken.const";

@Module({})
export class AppMemoryModule {
    // Todo: schema 만들기
    static register(schemaArr: Function[]): DynamicModule {

        const appMemoryServiceAliasProvider: ExistingProvider<InMemoryStoreServiceI> = {
            provide: INMEMORY_STORE_SERVICE,
            useExisting: AppMemoryService,
        };

        const backupServiceAliasProvider: ExistingProvider<InMemoryStoreBackupServiceI> = {
            provide: INMEMORY_STORE_BACKUP_SERVICE,
            useExisting: BackupService,
        };

        const schemaProviders: ValueProvider[] = schemaArr.map(schema => ({
            provide: schema.name,
            useValue: schema,
        }));

        const schemaRepositorys: FactoryProvider<InMemoryRepositoryI<InMemorySchemaI>>[] = schemaArr.map(schema => ({
            provide: schema.name + INMEMORY_SCHEMA_REPOSITORY_SUFFIX,
            useFactory(appMemSrv: AppMemoryService, schema: InMemorySchemaI) {
                return new AppMemoryRepository(appMemSrv, schema);
            },
            inject: [INMEMORY_STORE_SERVICE, schema.name],
        }));

        return {
            module: AppMemoryModule,
            imports: [
                CacheModule.register({
                    ttl: 60 * 60 * 24 * 5, // 5 days
                }),
                Pm2Module
            ],
            providers: [
                AppMemoryService,
                BackupService,
                appMemoryServiceAliasProvider,
                backupServiceAliasProvider,
                ...schemaProviders,
                ...schemaRepositorys,
            ],
            exports: [
                appMemoryServiceAliasProvider,
                backupServiceAliasProvider,
                ...schemaRepositorys,
            ]
        }
    }
}
