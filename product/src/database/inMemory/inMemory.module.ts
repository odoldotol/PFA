import { Module } from "@nestjs/common";
import { AppMemoryModule } from "../appMemory/appMemory.module";
import { RedisModule } from "../redis/redis.module";

@Module({
    imports: [
        AppMemoryModule,
        RedisModule
    ],
    providers: [],
    exports: []
})
export class InMemoryModule {}
