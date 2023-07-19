import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ChildApiService } from "./child-api/child-api.service";
import { Exchange } from "./class/exchange";
import { ExchangeContainer } from "./exchangeContainer";
import { 
  EXCHANGE_CONFIG_ARR_TOKEN,
  TExchangeConfigArrProvider
} from "./provider/exchangeConfigArr.provider";

@Injectable()
export class ExchangeService implements OnModuleInit {

  private readonly logger = new Logger(ExchangeService.name);

  constructor(
    private readonly container: ExchangeContainer,
    @Inject(EXCHANGE_CONFIG_ARR_TOKEN) private readonly exchangeConfigArr: TExchangeConfigArrProvider,
    private readonly childApiSrv: ChildApiService
  ) {}

  onModuleInit() {
    this.exchangeConfigArr.forEach((exchangeConfig) => {
    this.container.add(new Exchange(exchangeConfig, this.childApiSrv)); // is it anti-pattern?
    });
  }

  async subscribe(exchangeId: Exchange["id"]) {
    const exchange = this.container.getOne(exchangeId);
    if (!exchange) {
      throw new Error("Not exists exchange");
    }
    try {
      await exchange.subscribe();
      exchange.on('error', e => {
        throw e;
      });
      this.logger.verbose(`Subscribed ${exchange.id}`);
    } catch (e) {
      this.logger.warn(e);
    }
    return exchange;
  }

}