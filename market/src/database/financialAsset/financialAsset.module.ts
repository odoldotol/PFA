import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Database_ExchangeModule } from "..";
import { FinancialAssetEntity } from "./financialAsset.entity";
import { Database_FinancialAssetService } from "./financialAsset.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([FinancialAssetEntity]),
    Database_ExchangeModule,
  ],
  providers: [Database_FinancialAssetService],
  exports: [Database_FinancialAssetService]
})
export class Database_FinancialAssetModule {}