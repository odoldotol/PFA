import { CacheModule, Module } from "@nestjs/common";
import { AppMemoryService } from "./appMemory.service";
import { MarketDateRepository } from "./marketDate.repository";
import { PriceRepository } from "./price.repository";

@Module({
    imports: [
        CacheModule.register({
            ttl: 60 * 60 * 24 * 5, // 5 days
        }),
    ],
    providers: [
        AppMemoryService,
        MarketDateRepository,
        PriceRepository,
    ],
    exports: [
        AppMemoryService,
        MarketDateRepository,
        PriceRepository,
    ]
})
export class AppMemoryModule {}
