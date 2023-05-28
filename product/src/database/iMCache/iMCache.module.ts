import { CacheModule, Module } from "@nestjs/common";
import { Pm2Module } from "src/pm2/pm2.module";
import { BackupService } from "./backup.service";
import { IMCacheRepository } from "./iMCache.repository";

@Module({
    imports: [
        CacheModule.register({
            ttl: 60 * 60 * 24 * 5, // 5 days
        }),
        Pm2Module
    ],
    providers: [
        IMCacheRepository,
        BackupService
    ],
    exports: [
        IMCacheRepository,
        BackupService
    ]
})
export class IMCache {}
