import { Module } from "@nestjs/common";
import { RedisModule } from "../redis/redis.module";
import { CachedPrice } from "./price.schema";
import { PriceService } from "./price.service";

@Module({
  imports: [RedisModule.forFeature([{
    schema: CachedPrice,
    ttl: 60 * 60 * 24 * 5
  }])],
  providers: [PriceService],
  exports: [PriceService]
})
export class PriceModule {}
