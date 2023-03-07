import { CacheModule, Module } from "@nestjs/common";
import { DBRepository } from "./database.repository";

@Module({
    imports: [
        CacheModule.register({
            ttl: 60 * 60 * 24 * 5, // 5 days
        }),
    ],
    providers: [DBRepository],
    exports: [DBRepository]
})
export class DBModule {}