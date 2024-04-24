import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { GlobalThrottlerGuard } from "src/common/guard";
import { ExchangeService } from "./exchange.service";
import { Api_getAllExchangesFromDatabase } from "./decorator";

@Controller("exchange")
@UseGuards(GlobalThrottlerGuard)
@ApiTags("Exchange")
export class ExchangeController {

  constructor(
    private readonly exchangeService: ExchangeService,
  ) {}

  @Get()
  @Api_getAllExchangesFromDatabase()
  getAllExchanges() {
    return this.exchangeService.getAllExchanges();
  }

}
