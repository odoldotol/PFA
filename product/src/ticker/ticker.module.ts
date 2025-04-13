import { Module } from "@nestjs/common";
import { OpenAIModule } from "src/openai";
import { RedisModule } from "src/database";
import { ResponseRedisEntity } from "./redis.entity";
import { YahooFinanceTickerService } from "./yahooFinance.service";

@Module({
  imports: [
    OpenAIModule,
    RedisModule.forFeature([
      {
        entity: ResponseRedisEntity,
        ttl: 60 * 60 * 24 // todo
      },
    ]),
  ],
  providers: [
    YahooFinanceTickerService,
  ],
  exports: [
    YahooFinanceTickerService,
  ]
})
export class TickerModule {}
