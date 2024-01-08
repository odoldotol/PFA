import { Module } from "@nestjs/common";
import { AssetModule } from "src/asset/asset.module";
import { ExchangeModule } from "src/exchange/exchange.module";
import { Database_UpdaterModule } from "src/database/updater/updater.module";
import { ProductApiModule } from "src/productApi/productApi.module";
import { UpdaterService } from "./updater.service";

@Module({
  imports: [
    AssetModule,
    ExchangeModule,
    Database_UpdaterModule,
    ProductApiModule,
  ],
  providers: [UpdaterService],
})
export class UpdaterModule {}
