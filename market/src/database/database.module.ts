import { Module } from "@nestjs/common";
import { MongodbModule } from "./mongodb/mongodb.module";
import { PostgresModule } from "./postgres/postgres.module";
import { Database_ExchangeModule } from "./exchange/exchange.module";
import { Database_FinancialAssetModule } from "./financialAsset/financialAsset.module";
import { LogPriceUpdateModule } from "./log_priceUpdate/log_priceUpdate.module";
import { YfinanceInfoModule } from "./yf_info/yf_info.module";
import { UpdaterService } from "./updater.service";

@Module({
  imports: [
    MongodbModule,
    PostgresModule,
    Database_ExchangeModule,
    Database_FinancialAssetModule,
    LogPriceUpdateModule,
    YfinanceInfoModule
  ],
  providers: [
    UpdaterService
  ],
  exports: [
    Database_ExchangeModule,
    Database_FinancialAssetModule,
    LogPriceUpdateModule,
    YfinanceInfoModule,
    UpdaterService
  ]
})
export class DatabaseModule {}