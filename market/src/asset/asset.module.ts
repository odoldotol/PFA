import { Module } from "@nestjs/common";
import { DatabaseModule } from "src/database/database.module";
import { MarketModule } from "src/market/market.module";
import { UpdaterModule } from "src/updater/updater.module";
import { AssetController } from "./asset.controller";
import { AssetService } from "./asset.service";

@Module({
  imports: [
    MarketModule,
    DatabaseModule,
    UpdaterModule
  ],
  controllers: [AssetController],
  providers: [AssetService],
})
export class AssetModule {}
