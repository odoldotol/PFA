import { Module } from "@nestjs/common";
import { ChildApiModule } from "../childApi";
import { Market_ExchangeModule } from "../exchange";
import { Market_FinancialAssetService } from "./financialAsset.service";

@Module({
  imports: [
    ChildApiModule,
    Market_ExchangeModule
  ],
  providers: [Market_FinancialAssetService],
  exports: [Market_FinancialAssetService]
})
export class Market_FinancialAssetModule {}
