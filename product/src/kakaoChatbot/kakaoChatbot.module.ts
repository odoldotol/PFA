import { Module } from "@nestjs/common";
import { MarketApiModule } from "src/marketApi";
import { AssetModule } from "src/asset";
import {
  AssetSubscriptionModule,
  UserModule
} from "src/database";
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
