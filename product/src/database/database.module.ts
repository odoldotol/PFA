import { Module } from "@nestjs/common";
import { DBRepository } from "./database.repository";
import { IMCache } from "./iMCache/iMCache.module";
import { RedisModule } from "./redis/redis.module";

@Module({
    imports: [
        IMCache,
        RedisModule
    ],
    providers: [DBRepository],
    exports: [DBRepository]
})
export class DBModule {}