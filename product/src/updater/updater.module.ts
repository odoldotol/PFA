import { Module } from "@nestjs/common";
import { MarketApiModule } from "src/marketApi/marketApi.module";
import { UpdaterController } from "./updater.controller";
import { UpdaterService } from "./updater.service";
import { MarketDateModule } from "src/database/marketDate/marketDate.module";
import { PriceModule } from "src/database/price/price.module";

@Module({
  imports: [
    MarketApiModule,
    MarketDateModule,
    PriceModule,
  ],
  controllers: [UpdaterController],
  providers: [UpdaterService]
})
export class UpdaterModule {}
