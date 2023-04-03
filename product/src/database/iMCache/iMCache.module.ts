import { CacheModule, Module } from "@nestjs/common";
import { Pm2Module } from "../../pm2/pm2.module";
import { IMCacheRepository } from "./iMCache.repository";

@Module({
    imports: [
        CacheModule.register({
            ttl: 60 * 60 * 24 * 5, // 5 days
        }),
        Pm2Module
    ],
    providers: [IMCacheRepository],
    exports: [IMCacheRepository]
})
export class IMCache {}