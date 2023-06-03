import { Module } from "@nestjs/common";
import { AppMemoryModule } from "./appMemory/appMemory.module";
import { RedisModule } from "./redis/redis.module";
import { InMemoryService } from "./inMemory.service";
import { MarketDateService } from "./marketDate.service";
import { PriceService } from "./price.service";
import { MarketDate } from "src/common/class/marketDate.class";
import { CachedPrice } from "src/common/class/cachedPrice.class";

@Module({
    imports: [
        // 다이나믹으로 환경변수 읽어서 연결하도록 할까?
        AppMemoryModule.register([MarketDate, CachedPrice]),
        RedisModule
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
