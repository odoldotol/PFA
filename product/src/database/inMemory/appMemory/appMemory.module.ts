import { CacheModule, DynamicModule, Module, CACHE_MANAGER, CacheModuleOptions } from "@nestjs/common";
import { Cache } from "cache-manager";
import { AppMemoryService } from "./appMemory.service";
import { AppMemoryRepository } from "./appMemory.repository";

@Module({})
export class AppMemoryModule {
    // Todo: schema 만들기
    static register(schemaArr: Function[]): DynamicModule {
        return {
            module: AppMemoryModule,
            imports: [
                CacheModule.register(),
            ],
            providers: [
                AppMemoryService,
                ...schemaArr.map(schema => ({
                    provide: schema.name,
                    useValue: schema,
                })),
                ...schemaArr.map(schema => ({
                    provide: schema.name+"REPOSITORY",
                    useFactory(appMemSrv: AppMemoryService, schema: InMemorySchema, cacheManager: Cache) {
                        return new AppMemoryRepository(appMemSrv, schema, cacheManager);
                    },
                    inject: [AppMemoryService, schema.name, CACHE_MANAGER],
                })),
            ],
            exports: [
                AppMemoryService,
                ...schemaArr.map(schema => schema.name+"REPOSITORY"),
            ]
        }
    }
}
