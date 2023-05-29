import { Module } from "@nestjs/common";
import { DatabaseService } from "./database.service";
import { AppMemoryModule } from "./appMemory/appMemory.module";
import { RedisModule } from "./redis/redis.module";

@Module({
    imports: [
        AppMemoryModule,
        RedisModule
    ],
    providers: [DatabaseService],
    exports: [DatabaseService]
})
export class DBModule {}