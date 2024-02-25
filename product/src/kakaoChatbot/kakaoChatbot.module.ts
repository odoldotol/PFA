import { Module } from "@nestjs/common";
import { MarketApiModule } from "src/marketApi/marketApi.module";
import { AssetModule } from "src/asset/asset.module";
import { UserModule } from "src/database/user/user.module";
import { AssetSubscriptionModule } from "src/database/assetSubscription/assetSubscription.module";
import { KakaoChatbotController } from "./kakaoChatbot.controller";
import { KakaoChatbotService } from "./kakaoChatbot.service";
import { SkillResponseService } from "./skillResponse.service";

@Module({
  imports: [
    MarketApiModule, //
    AssetModule,
    UserModule,
    AssetSubscriptionModule
  ],
  controllers: [KakaoChatbotController],
  providers: [
    KakaoChatbotService,
    SkillResponseService,
  ]
})
export class KakaoChatbotModule {}
