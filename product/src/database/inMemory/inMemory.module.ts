import { CacheModule, Module } from "@nestjs/common";
import { Pm2Module } from "src/pm2/pm2.module";
import { BackupService } from "./backup.service";
import { InMemoryService } from "./inMemory.service";
import { MarketDateService } from "./marketDate.service";
import { PriceService } from "./price.service";

@Module({
    imports: [
        CacheModule.register({
            ttl: 60 * 60 * 24 * 5, // 5 days
        }),
        Pm2Module
    ],
    providers: [
        InMemoryService,
        BackupService,
        MarketDateService,
        PriceService
    ],
    exports: [
        InMemoryService,
        BackupService,
        MarketDateService,
        PriceService
    ]
})
export class InMemoryModule {}
