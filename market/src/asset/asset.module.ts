import { Module } from "@nestjs/common";
import { Market_FinancialAssetModule } from "src/market/financialAsset/financialAsset.module";
import { Database_FinancialAssetModule } from "src/database/financialAsset/financialAsset.module";
import { YfinanceInfoModule } from "src/database/yf_info/yf_info.module";
import { AssetController } from "./asset.controller";
import { SubscriberService } from "./service/subscriber.service";
import { AccessorService } from "./service/accessor.service";

@Module({
  imports: [
    Market_FinancialAssetModule,
    Database_FinancialAssetModule,
    YfinanceInfoModule
  ],
  controllers: [AssetController],
  providers: [
    SubscriberService,
    AccessorService
  ],
  exports: [AccessorService]
})
export class AssetModule {}
