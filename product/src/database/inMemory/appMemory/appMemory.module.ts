import { CacheModule, DynamicModule, Module, ValueProvider, FactoryProvider } from "@nestjs/common";
import { Pm2Module } from "src/pm2/pm2.module";
import { AppMemoryService } from "./appMemory.service";
import { BackupService } from "./backup.service";
import { AppMemoryRepository } from "./appMemory.repository";

@Module({})
export class AppMemoryModule {
    // Todo: schema 만들기
    static register(schemaArr: Function[]): DynamicModule {

        const schemaProviders: ValueProvider[] = schemaArr.map(schema => ({
            provide: schema.name,
            useValue: schema,
        }));

        const schemaRepositorys: FactoryProvider[] = schemaArr.map(schema => ({
            provide: schema.name+"REPOSITORY",
            useFactory(appMemSrv: AppMemoryService, schema: InMemorySchema) {
                return new AppMemoryRepository(appMemSrv, schema);
            },
            inject: [AppMemoryService, schema.name],
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
                ...schemaProviders,
                ...schemaRepositorys,
            ],
            exports: [
                AppMemoryService,
                BackupService,
                ...schemaRepositorys,
            ]
        }
    }
}
