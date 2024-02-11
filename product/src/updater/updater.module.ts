import { Module } from "@nestjs/common";
import { MarketApiModule } from "src/marketApi/marketApi.module";
import { TempModule } from "src/database/database.module";
import { UpdaterController } from "./updater.controller";
import { UpdaterService } from "./updater.service";

@Module({
  imports: [
    MarketApiModule,
    TempModule
  ],
  controllers: [UpdaterController],
  providers: [UpdaterService]
})
export class UpdaterModule {}
