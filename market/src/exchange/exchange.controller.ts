import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ExchangeService } from "./exchange.service";
import { Api_getAllExchangesFromDatabase } from "./decorator";

@Controller("exchange")
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
