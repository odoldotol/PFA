import { Module } from "@nestjs/common";
import { MongoModule } from "./mongodb/mongodb.module";
import { PostgresModule } from "./postgres/postgres.module";
import { ExchangeModule } from "./exchange/exchange.module";
import { FinancialAssetModule } from "./financialAsset/financialAsset.module";
import { Log_priceUpdateModule } from "./log_priceUpdate/log_priceUpdate.module";
import { Yf_infoModule } from "./yf_info/yf_info.module";
import { UpdaterService } from "./updater.service";

@Module({
  imports: [
    MongoModule,
    PostgresModule,
    ExchangeModule,
    FinancialAssetModule,
    Log_priceUpdateModule,
    Yf_infoModule
  ],
  providers: [
    UpdaterService
  ],
  exports: [
    ExchangeModule,
    FinancialAssetModule,
    Log_priceUpdateModule,
    Yf_infoModule,
    UpdaterService
  ]
})
export class DatabaseModule {}