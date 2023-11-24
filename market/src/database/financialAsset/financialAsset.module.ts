import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FinancialAsset } from "./financialAsset.entity";
import { Database_FinancialAssetService } from "./financialAsset.service";

@Module({
  imports: [TypeOrmModule.forFeature([FinancialAsset])],
  providers: [Database_FinancialAssetService],
  exports: [Database_FinancialAssetService]
})
export class Database_FinancialAssetModule {}