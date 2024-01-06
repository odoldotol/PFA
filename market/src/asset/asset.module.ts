import { Module } from "@nestjs/common";
import { DatabaseModule } from "src/database/database.module";
import { MarketModule } from "src/market/market.module";
import { ProductApiModule } from "src/productApi/productApi.module";
import { AssetController } from "./asset.controller";
import { UpdaterService } from "./service/updater.service";
import { AdderService } from "./service/adder.service";
import { AccessorService } from "./service/accessor.service";

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
