import { CacheModule, DynamicModule, Module } from "@nestjs/common";
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
                    useFactory(appMemSrv: AppMemoryService, schema: InMemorySchema) {
                        return new AppMemoryRepository(appMemSrv, schema);
                    },
                    inject: [AppMemoryService, schema.name],
                })),
            ],
            exports: [
                AppMemoryService,
                ...schemaArr.map(schema => schema.name+"REPOSITORY"),
            ]
        }
    }
}
