import { Module } from "@nestjs/common";
import { CachedPrice } from "src/common/class/cachedPrice.class";
import { MarketDate } from "src/common/class/marketDate.class";
import { AppMemoryModule } from "./appMemory/appMemory.module";
import { InMemoryService } from "./inMemory.service";
import { MarketDateService } from "./marketDate.service";
import { PriceService } from "./price.service";

@Module({
    imports: [
        AppMemoryModule.register([MarketDate, CachedPrice])
    ],
    providers: [
        InMemoryService,
        MarketDateService,
        PriceService
    ],
    exports: [
        InMemoryService,
        MarketDateService,
        PriceService
    ]
})
export class InMemoryModule {}
