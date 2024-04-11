import { Module } from "@nestjs/common";
import { MarketApiModule } from "src/marketApi";
import { UpdaterController } from "./updater.controller";
import { UpdaterService } from "./updater.service";
import {
  MarketDateModule,
  PriceModule
} from "src/database";

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
