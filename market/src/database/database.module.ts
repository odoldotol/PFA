import { Module } from "@nestjs/common";
import { MongoModule } from "./mongodb/mongodb.module";
import { PostgresModule } from "./postgres/postgres.module";
import { ExchangeModule } from "./exchange/exchange.module";
import { FinancialAssetModule } from "./financialAsset/financialAsset.module";
import { Log_priceUpdateModule } from "./log_priceUpdate/log_priceUpdate.module";
import { DBRepository } from "./database.repository";
import { Yf_infoModule } from "./yf_info/yf_info.module";

@Module({
  imports: [
    MongoModule,
    PostgresModule,
    ExchangeModule,
    FinancialAssetModule,
    Log_priceUpdateModule,
    Yf_infoModule
  ],
  providers: [DBRepository],
  exports: [
    DBRepository,
    ExchangeModule,
    FinancialAssetModule,
    Log_priceUpdateModule,
    Yf_infoModule
  ]
})
export class DBModule {}