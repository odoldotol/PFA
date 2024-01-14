import { Module } from "@nestjs/common";
import { KakaoCBController } from "./kakao-chatbot.controller";
import { KakaoCBService } from "./kakao-chatbot.service";
import { MarketModule } from "../market/market.module";
import { DBModule } from "../database/database.module";

@Module({
  imports: [
    MarketModule,
    DBModule
  ],
  controllers: [KakaoCBController],
  providers: [KakaoCBService]
})
export class KakaoCBModule {}
