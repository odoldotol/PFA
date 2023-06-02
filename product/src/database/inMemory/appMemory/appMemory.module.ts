import { CacheModule, DynamicModule, Module, CACHE_MANAGER } from "@nestjs/common";
import { Cache } from "cache-manager";
import { AppMemoryService } from "./appMemory.service";
import { AppMemoryRepository } from "./appMemory.repository";
import { PriceRepository } from "./price.repository";

@Module({})
export class AppMemoryModule {
    // Todo: schema 만들기
    static register(schemaArr: Function[]): DynamicModule {
        return {
            module: AppMemoryModule,
            imports: [
                CacheModule.register({
                    ttl: 60 * 60 * 24 * 5, // 5 days
                }),
            ],
            providers: [
                AppMemoryService,
                PriceRepository,
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
                PriceRepository,
                ...schemaArr.map(schema => schema.name+"REPOSITORY"),
            ]
        }
    }
}
