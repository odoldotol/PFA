import { Module } from "@nestjs/common";
import { ChildApiModule } from "../child_api/child_api.module";
import { Market_ExchangeService } from "./exchange.service";
import { ExchangeContainer } from "./container";
import { ExchangeConfigArrProvider } from "./provider/exchangeConfigArr.provider";

@Module({
  imports: [ChildApiModule],
  providers: [
    Market_ExchangeService,
    ExchangeContainer,
    ExchangeConfigArrProvider
  ],
  exports: [Market_ExchangeService]
})
export class Market_ExchangeModule {}
