import { Module } from "@nestjs/common";
import { MongodbModule } from "./mongodb/mongodb.module";
import { PostgresModule } from "./postgres/postgres.module";
import { Database_ExchangeModule } from "./exchange/exchange.module";
import { Database_FinancialAssetModule } from "./financialAsset/financialAsset.module";
import { LogPriceUpdateModule } from "./log_priceUpdate/log_priceUpdate.module";
import { YfinanceInfoModule } from "./yf_info/yf_info.module";
import { DatabaseService } from "./database.service";

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
    DatabaseService
  ],
  exports: [
    Database_ExchangeModule,
    Database_FinancialAssetModule,
    LogPriceUpdateModule,
    YfinanceInfoModule,
    DatabaseService
  ]
})
export class DatabaseModule {}