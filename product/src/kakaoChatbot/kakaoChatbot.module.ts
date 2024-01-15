import { Module } from "@nestjs/common";
import { KakaoChatbotController } from "./kakaoChatbot.controller";
import { KakaoChatbotService } from "./kakaoChatbot.service";
import { MarketModule } from "../market/market.module";
import { UserModule } from "src/database/user/user.module";
import { AssetSubscriptionModule } from "src/database/assetSubscription/assetSubscription.module";

@Module({
  imports: [
    MarketModule,
    UserModule,
    AssetSubscriptionModule
  ],
  controllers: [KakaoChatbotController],
  providers: [KakaoChatbotService]
})
export class KakaoChatbotModule {}
