import { Module } from "@nestjs/common";
import { Market_FinancialAssetModule } from "src/market";
import {
  Database_FinancialAssetModule,
  YfinanceInfoModule
} from "src/database";
import { AssetController } from "./asset.controller";
import {
  AccessorService,
  SubscriberService
} from "./service";

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
