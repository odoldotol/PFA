import { CacheModule, Module } from "@nestjs/common";
import { DBRepository } from "./database.repository";
import { IMCache } from "./iMCache/iMcache.module";

@Module({
    imports: [
        IMCache
    ],
    providers: [DBRepository],
    exports: [DBRepository]
})
export class DBModule {}