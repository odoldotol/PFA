import { Module } from "@nestjs/common";
import { Database_ExchangeModule } from "src/database/exchange/exchange.module";
import { Market_ExchangeModule } from "src/market/exchange/exchange.module";
import { ExchangeController } from "./exchange.controller";
import { ExchangeService } from "./exchange.service";

@Module({
  imports: [
    Database_ExchangeModule,
    Market_ExchangeModule
  ],
  controllers: [ExchangeController],
  providers: [ExchangeService],
  exports: [ExchangeService]
})
export class ExchangeModule {}
