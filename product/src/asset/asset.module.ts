import { Module } from "@nestjs/common";
import {
  PriceModule,
  MarketDateModule
} from "src/database";
import { MarketApiModule } from "src/marketApi";
import { AssetController } from "./asset.controller";
import { AssetService } from "./asset.service";

@Module({
  imports: [
    PriceModule,
    MarketDateModule,
    MarketApiModule,
  ],
  controllers: [AssetController],
  providers: [AssetService],
  exports: [AssetService]
})
export class AssetModule {}
