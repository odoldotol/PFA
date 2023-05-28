import { Module } from "@nestjs/common";
import { DatabaseService } from "./database.service";
import { IMCache } from "./iMCache/iMCache.module";
import { RedisModule } from "./redis/redis.module";

@Module({
    imports: [
        IMCache,
        RedisModule
    ],
    providers: [DatabaseService],
    exports: [DatabaseService]
})
export class DBModule {}