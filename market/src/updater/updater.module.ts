import { Module } from "@nestjs/common";
import { AssetModule } from "src/asset/asset.module";
import { DatabaseModule } from "src/database/database.module";
import { ExchangeModule } from "src/exchange/exchange.module";
import { ProductApiModule } from "src/productApi/productApi.module";
import { UpdaterService } from "./updater.service";

@Module({
  imports: [
    AssetModule,
    ExchangeModule,
    DatabaseModule,
    ProductApiModule,
  ],
  providers: [UpdaterService],
})
export class UpdaterModule {}
