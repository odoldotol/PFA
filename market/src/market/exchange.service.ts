import { 
  Inject,
  Injectable,
  OnModuleInit
} from "@nestjs/common";
import { Exchange } from "./class/exchange";
import { ExchangeContainer } from "./exchangeContainer";
import { 
  EXCHANGE_CONFIG_ARR_TOKEN,
  TExchangeConfigArrProvider
} from "./provider/exchangeConfigArr.provider";

@Injectable()
export class ExchangeService implements OnModuleInit {

  constructor(
    private readonly container: ExchangeContainer,
    @Inject(EXCHANGE_CONFIG_ARR_TOKEN) private readonly exchangeConfigArr: TExchangeConfigArrProvider
  ) {}

  onModuleInit() {
    this.exchangeConfigArr.forEach((exchangeConfig) => {
      const exchange = new Exchange(exchangeConfig);
      this.container.add(exchange);
    });
  }

}
