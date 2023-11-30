import { Module } from "@nestjs/common";
import { ChildApiModule } from "../child_api/child_api.module";
import { Market_FinancialAssetService } from "./financialAsset.service";

@Module({
  imports: [ChildApiModule],
  providers: [Market_FinancialAssetService],
  exports: [Market_FinancialAssetService]
})
export class Market_FinancialAssetModule {}
