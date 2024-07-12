import { Module } from "@nestjs/common";
import { MarketApiModule } from "src/marketApi";
import { FinancialAssetModule } from "src/financialAsset";
import { MarketDateModule } from "src/marketDate";
import { UpdaterController } from "./updater.controller";
import { UpdaterService } from "./updater.service";

@Module({
  imports: [
    MarketApiModule,
    MarketDateModule,
    FinancialAssetModule
  ],
  controllers: [UpdaterController],
  providers: [UpdaterService]
})
export class UpdaterModule {}
