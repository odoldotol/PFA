import { Module } from "@nestjs/common";
import { RedisModule } from "../database";
import { MarketDateRedisEntity } from "./marketDate.redis.entity";
import { MarketDateService } from "./marketDate.service";

@Module({
  // Todo - model
  imports: [RedisModule.forFeature([{ entity: MarketDateRedisEntity }])],
  providers: [MarketDateService],
  exports: [MarketDateService],
})
export class MarketDateModule {}
