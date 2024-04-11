import { Module } from "@nestjs/common";
import { AssetModule } from "src/asset";
import { ExchangeModule } from "src/exchange";
import { Database_UpdaterModule } from "src/database";
import { ProductApiModule } from "src/productApi";
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
