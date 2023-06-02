import { Module } from "@nestjs/common";
import { CachedPrice } from "src/common/class/cachedPrice.class";
import { MarketDate } from "src/common/class/marketDate.class";
import { Pm2Module } from "src/pm2/pm2.module";
import { AppMemoryModule } from "./appMemory/appMemory.module";
import { BackupService } from "./backup.service";
import { InMemoryService } from "./inMemory.service";
import { MarketDateService } from "./marketDate.service";
import { PriceService } from "./price.service";

@Module({
    imports: [
        AppMemoryModule.register([MarketDate, CachedPrice]),
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
