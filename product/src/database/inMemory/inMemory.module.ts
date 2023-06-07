import { Module } from "@nestjs/common";
import { AppMemoryModule } from "./appMemory/appMemory.module";
import { RedisModule } from "./redis/redis.module";
import { InMemoryService } from "./inMemory.service";
import { MarketDateService } from "./marketDate.service";
import { PriceService } from "./price.service";
import { marketDateSchema, priceSchema } from "./class/schema.class";

@Module({
    imports: [
        // Todo: 다이나믹으로 환경변수 읽어서 연결하도록 해보기
        // AppMemoryModule.register([marketDateSchema, priceSchema]),
        RedisModule.register([marketDateSchema, priceSchema]),
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
