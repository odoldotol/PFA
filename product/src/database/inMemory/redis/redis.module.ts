import { DynamicModule, FactoryProvider, Module, ValueProvider } from "@nestjs/common";
import { ConnectService } from "./connect.service";
import { RedisService } from "./redis.service";
import { RedisRepository } from "./redis.repository";

@Module({})
export class RedisModule {
    // Todo: schema 만들기
    static register(schemaArr: Function[]): DynamicModule {

        const schemaProviders: ValueProvider[] = schemaArr.map(schema => ({
            provide: schema.name,
            useValue: schema,
        }));

        const schemaRepositorys: FactoryProvider[] = schemaArr.map(schema => ({
            provide: schema.name+"REPOSITORY",
            useFactory(redisSrv: RedisService, schema: InMemorySchema) {
                return new RedisRepository(redisSrv, schema);
            },
            inject: [RedisService, schema.name],
        }));

        return {
            module: RedisModule,
            providers: [
                RedisService,
                ...schemaProviders,
                ...schemaRepositorys,
            ],
            exports: [
                RedisService,
                ...schemaRepositorys,
            ]
        }
    }
}