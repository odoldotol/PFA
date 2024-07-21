import { Module } from "@nestjs/common";
import { MarketApiModule } from "src/marketApi";
import {
  AssetSubscriptionModule,
  UserModule
} from "src/database";
import { FinancialAssetModule } from "src/financialAsset";
import { KakaoChatbotController } from "./kakaoChatbot.controller";
import { KakaoChatbotService } from "./kakaoChatbot.service";
import { SkillResponseService } from "./skillResponse.service";
import { TextService } from "./text.service";

@Module({
  imports: [
    MarketApiModule, //
    FinancialAssetModule,
    UserModule,
    AssetSubscriptionModule
  ],
  controllers: [KakaoChatbotController],
  providers: [
    KakaoChatbotService,
    SkillResponseService,
    TextService,
  ]
})
export class KakaoChatbotModule {}
