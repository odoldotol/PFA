import { Module } from "@nestjs/common";
import { ChildApiModule } from "../childApi/childApi.module";
import { Market_FinancialAssetService } from "./financialAsset.service";

@Module({
  imports: [ChildApiModule],
  providers: [Market_FinancialAssetService],
  exports: [Market_FinancialAssetService]
})
export class Market_FinancialAssetModule {}
