import { Module } from "@nestjs/common";
import { OpenAIModule } from "src/openai";
import { YahooFinanceTickerService } from "./yahooFinance.service";

@Module({
  imports: [
    OpenAIModule,
  ],
  providers: [
    YahooFinanceTickerService,
  ],
  exports: [
    YahooFinanceTickerService,
  ]
})
export class TickerModule {}
