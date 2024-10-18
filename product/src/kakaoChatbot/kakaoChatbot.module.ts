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
import {
  StorebotSurveyTestController,
  StorebotSurveyTestService,
  StorebotSurveyRepository,
  StorebotSurveyText,
} from "./storebot.survey.test";
import { AuthService } from "./auth.service";
import { MongooseModule } from "@nestjs/mongoose";
import {
  StorebotSurvey,
  StorebotSurveySchema
} from "./storebot.survey.test/storebotSurvey.schema";

@Module({
  imports: [
    MarketApiModule, //
    FinancialAssetModule,
    UserModule,
    AssetSubscriptionModule,
    MongooseModule.forFeature([
      { name: StorebotSurvey.name, schema: StorebotSurveySchema},
    ])
  ],
  controllers: [
    KakaoChatbotController,
    StorebotSurveyTestController,
  ],
  providers: [
    AuthService,
    KakaoChatbotService,
    SkillResponseService,
    TextService,
    StorebotSurveyTestService,
    StorebotSurveyRepository,
    StorebotSurveyText,
  ]
})
export class KakaoChatbotModule {}
