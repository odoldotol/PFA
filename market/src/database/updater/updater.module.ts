import { Module } from "@nestjs/common";
import {
  Database_ExchangeModule,
  Database_FinancialAssetModule,
  LogPriceUpdateModule
} from "../";
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
