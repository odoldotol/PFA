import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AssetSubscriptionService } from "./assetSubscription.service";
import { AssetSubscription } from "./assetSubscription.entity";

@Module({
  imports: [TypeOrmModule.forFeature([AssetSubscription])],
  providers: [AssetSubscriptionService],
  exports: [AssetSubscriptionService]
})
export class AssetSubscriptionModule {}
