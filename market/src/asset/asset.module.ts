import { Module } from "@nestjs/common";
import { DatabaseModule } from "src/database/database.module";
import { MarketModule } from "src/market/market.module";
import { AssetController } from "./asset.controller";
import { AssetService } from "./asset.service";
import { UpdaterService } from "./updater.service";
import { ProductApiModule } from "src/product_api/product_api.module";

@Module({
  imports: [
    MarketModule,
    DatabaseModule,
    ProductApiModule
  ],
  controllers: [AssetController],
  providers: [
    AssetService,
    UpdaterService
  ],
})
export class AssetModule {}
