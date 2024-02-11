import { Module } from "@nestjs/common";
import { PriceModule } from "src/database/price/price.module";
import { MarketDateModule } from "src/database/marketDate/marketDate.module";
import { MarketApiModule } from "src/marketApi/marketApi.module";
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
