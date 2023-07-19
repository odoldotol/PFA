import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { TExchangeCore } from "src/common/type/exchange.type";
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

  public async subscribe(exchangeCore: TExchangeCore) {
    const exchange = this.getExchagne(exchangeCore);
    try {
      await exchange.subscribe();
      exchange.on('error', e => {
        throw e;
      });
      this.logger.verbose(`Subscribed ${exchange.ISO_Code}`);
    } catch (e) {
      this.logger.warn(e);
    }
  }

  public addMarketOpenListener(listener: (...args: any[]) => void, exchangeCore: TExchangeCore) {
    const exchange = this.getExchagne(exchangeCore);
    exchange.on('market.open', listener);
  }
  
  public addMarketCloseListener(listener: (...args: any[]) => void, exchangeCore: TExchangeCore) {
    const exchange = this.getExchagne(exchangeCore);
    exchange.on('market.close', listener);
  }

  public shouldUpdate(exchangeCore: TExchangeCore) {
    const exchange = this.getExchagne(exchangeCore);
    const result = new Date(exchangeCore.marketDate) < exchange.getMarketDate();
    result && exchange.isMarketOpen() && this.logger.warn(`${exchange.ISO_Code} : shouldUpdate return "true" while Open`);
    return result;
  }

  private getExchagne(exchangeCore: TExchangeCore) {
    const exchange = this.container.getOne(exchangeCore.ISO_Code);
    if (!exchange) {
      throw new Error("Not exists exchange");
    }
    return exchange;
  }

}