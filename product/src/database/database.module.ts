// Todo: 제거

import { Module } from "@nestjs/common";
import { MarketDateModule } from "./marketDate/marketDate.module";
import { PriceModule } from "./price/price.module";
import { DatabaseService } from "./database.service";

@Module({
  imports: [
    MarketDateModule,
    PriceModule
  ],
  providers: [DatabaseService],
  exports: [DatabaseService]
})
export class TempModule {}
