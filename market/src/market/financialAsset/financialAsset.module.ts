import { Module } from "@nestjs/common";
import { ChildApiModule } from "../child_api/child_api.module";
import { Market_ExchangeModule } from "../exchange/exchange.module";
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
