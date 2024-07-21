import { Module } from "@nestjs/common";
import { RedisModule } from "src/database";
import { MarketApiModule } from "src/marketApi";
import {
  FinancialAssetRedisEntity,
  MarketDateRedisEntity
} from "./redisEntity";
import { FinancialAssetController } from "./financialAsset.controller";
import { FinancialAssetService } from "./financialAsset.service";

@Module({
  // Todo - model
  imports: [
    RedisModule.forFeature([
      {
        entity: FinancialAssetRedisEntity,
        ttl: 60 * 60 * 24 * 5 // todo
      },
      {
        entity: MarketDateRedisEntity
      }
    ]),
    MarketApiModule
  ],
  controllers: [FinancialAssetController],
  providers: [FinancialAssetService],
  exports: [FinancialAssetService]
})
export class FinancialAssetModule {}
