import { Module } from "@nestjs/common";
import { Database_ExchangeModule } from "../exchange/exchange.module";
import { Database_FinancialAssetModule } from "../financialAsset/financialAsset.module";
import { LogPriceUpdateModule } from "../log_priceUpdate/log_priceUpdate.module";
import { Database_UpdaterService } from "./updater.service";

@Module({
  imports: [
    Database_ExchangeModule,
    Database_FinancialAssetModule,
    LogPriceUpdateModule,
  ],
  providers: [Database_UpdaterService],
  exports: [Database_UpdaterService]
})
export class Database_UpdaterModule {}
