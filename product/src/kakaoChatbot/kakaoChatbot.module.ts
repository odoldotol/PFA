import {
  MiddlewareConsumer,
  Module,
  NestModule
} from "@nestjs/common";
import {
  AssetSubscriptionModule,
  UserModule
} from "src/database";
import { TickerModule } from "src/ticker";
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
import {
  StorebotController,
  StorebotService,
  StorebotTextService
} from "./storebot";
import { AuthService } from "./auth.service";
import { MongooseModule } from "@nestjs/mongoose";
import {
  StorebotSurvey,
  StorebotSurveySchema
} from "./storebot.survey.test/storebotSurvey.schema";
import {
  LaunchAlarm,
  LaunchAlarmSchema
} from "./storebot/launchAlarm.schema";
import { MaintenanceMiddleware } from "./middleware";

@Module({
  imports: [
    TickerModule,
    FinancialAssetModule,
    UserModule,
    AssetSubscriptionModule,
    MongooseModule.forFeature([
      { name: StorebotSurvey.name, schema: StorebotSurveySchema },
      { name: LaunchAlarm.name, schema: LaunchAlarmSchema },
    ])
  ],
  controllers: [
    KakaoChatbotController,
    StorebotSurveyTestController,
    StorebotController,
  ],
  providers: [
    AuthService,
    KakaoChatbotService,
    SkillResponseService,
    TextService,
    StorebotSurveyTestService,
    StorebotSurveyRepository,
    StorebotSurveyText,
    StorebotService,
    StorebotTextService,
  ]
})
export class KakaoChatbotModule
  implements NestModule
{
  configure(consumer: MiddlewareConsumer) {
    consumer
    .apply(MaintenanceMiddleware)
    .forRoutes('*');
  }
}
