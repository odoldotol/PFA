import { CacheModule, Module } from "@nestjs/common";
import { DBRepository } from "./database.repository";
import { Pm2Module } from "src/pm2/pm2.module";

@Module({
    imports: [
        CacheModule.register({
            ttl: 60 * 60 * 24 * 5, // 5 days
        }),
        Pm2Module
    ],
    providers: [DBRepository],
    exports: [DBRepository]
})
export class DBModule {}