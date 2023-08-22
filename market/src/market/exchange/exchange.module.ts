import { Module } from "@nestjs/common";
import { ChildApiModule } from "../child_api/child_api.module";
import { ExchangeService } from "./exchange.service";
import { ExchangeContainer } from "./container";
import { ExchangeConfigArrProvider } from "./provider/exchangeConfigArr.provider";

@Module({
  imports: [ChildApiModule],
  providers: [
    ExchangeService,
    ExchangeContainer,
    ExchangeConfigArrProvider
  ],
  exports: [ExchangeService]
})
export class ExchangeModule {}
