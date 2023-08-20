import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FinancialAsset } from "./financialAsset.entity";
import { FinancialAssetService } from "./financialAsset.service";

@Module({
  imports: [TypeOrmModule.forFeature([FinancialAsset])],
  providers: [FinancialAssetService],
  exports: [FinancialAssetService]
})
export class FinancialAssetModule {}