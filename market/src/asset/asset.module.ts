import { Module } from "@nestjs/common";
import { DatabaseModule } from "src/database/database.module";
import { MarketModule } from "src/market/market.module";
import { ProductApiModule } from "src/product_api/product_api.module";
import { AssetController } from "./asset.controller";
import { UpdaterService } from "./updater.service";
import { AdderService } from "./adder.service";
import { AccessorService } from "./accessor.service";

@Module({
  imports: [
    MarketModule,
    DatabaseModule,
    ProductApiModule
  ],
  controllers: [AssetController],
  providers: [
    UpdaterService,
    AdderService,
    AccessorService
  ],
})
export class AssetModule {}
