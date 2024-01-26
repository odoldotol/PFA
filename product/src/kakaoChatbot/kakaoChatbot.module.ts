import { Module } from "@nestjs/common";
import { MarketModule } from "../market/market.module";
import { UserModule } from "src/database/user/user.module";
import { AssetSubscriptionModule } from "src/database/assetSubscription/assetSubscription.module";
import { KakaoChatbotController } from "./kakaoChatbot.controller";
import { KakaoChatbotService } from "./kakaoChatbot.service";
import { SkillResponseService } from "./skillResponse.service";
import { UnexpectedExceptionsFilter } from "./filter/UnexpectedExceptions.filter";

@Module({
  imports: [
    MarketModule,
    UserModule,
    AssetSubscriptionModule
  ],
  controllers: [KakaoChatbotController],
  providers: [
    KakaoChatbotService,
    SkillResponseService,
    UnexpectedExceptionsFilter,
  ]
})
export class KakaoChatbotModule {}
