import { Module } from "@nestjs/common";
import { RedisModule } from "../redis/redis.module";
import { MarketDate } from "./marketDate.schema";
import { MarketDateService } from "./marketDate.service";

@Module({
  imports: [RedisModule.forFeature([{ schema: MarketDate }])],
  providers: [MarketDateService],
  exports: [MarketDateService],
})
export class MarketDateModule {}
