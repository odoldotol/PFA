import { Module } from "@nestjs/common";
import { MongoModule } from "./mongodb/mongodb.module";
import { PostgresModule } from "./postgres/postgres.module";
import { ExchangeModule } from "./exchange/exchange.module";
import { FinancialAssetModule } from "./financialAsset/financialAsset.module";
import { DBRepository } from "./database.repository";

@Module({
  imports: [
    MongoModule,
    PostgresModule,
    ExchangeModule,
    FinancialAssetModule
  ],
  providers: [DBRepository],
  exports: [DBRepository]
})
export class DBModule {}