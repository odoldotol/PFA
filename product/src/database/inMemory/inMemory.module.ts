import { Module } from "@nestjs/common";
import { RedisModule } from "./redis/redis.module";
import { InMemoryService } from "./inMemory.service";
import { MarketDateService } from "./marketDate.service";
import { PriceService } from "./price.service";
import { marketDateSchema, priceSchema } from "./class/schema.class";

@Module({
  imports: [
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
