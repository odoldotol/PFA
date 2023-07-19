import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { TExchangeCore } from "src/common/type/exchange.type";
import { ChildApiService } from "./child-api/child-api.service";
import { Exchange } from "./class/exchange";
import { MARKET_CLOSE, MARKET_OPEN } from "./const/eventName.const";
import { ExchangeContainer } from "./exchangeContainer";
import { 
  EXCHANGE_CONFIG_ARR_TOKEN,
  TExchangeConfigArrProvider
} from "./provider/exchangeConfigArr.provider";
import { TCloseEventArgs, TOpenEventArgs } from "./type/eventArgs.type";

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
      exchange.on('error', e => {
        throw e;
      });
      this.addSessionLogger(exchange);
      const { marketOpen, nextEventDate } = await exchange.subscribe();
      marketOpen
      ? this.logger.verbose(
        `${exchange.ISO_Code} : NextClose at ${nextEventDate.toLocaleString("ko-KR")}`)
      : this.logger.verbose(
        `${exchange.ISO_Code} : NextOpen at ${nextEventDate.toLocaleString("ko-KR")}`);
    } catch (e) {
      this.logger.warn(e);
    }
  }

  // public open(
  //   listener: (...args: TOpenEventArgs) => void,
  //   exchangeCore: TExchangeCore
  // ) {
  //   const exchange = this.getExchagne(exchangeCore);
  //   this.addMarketOpenListener(listener, exchange);
  // }
  
  // public close(
  //   listener: (...args: TCloseEventArgs) => void,
  //   exchangeCore: TExchangeCore
  // ) {
  //   const exchange = this.getExchagne(exchangeCore);
  //   this.addMarketCloseListener(listener, exchange);
  // }

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

  private addSessionLogger(exchange: Exchange) {
    this.addMarketOpenListener(
      nextCloseDate => this.logger.verbose(
        `${exchange.ISO_Code} : Opened | NextClose at ${nextCloseDate}`
      ),
      exchange
    );
    this.addMarketCloseListener(
      nextOpenDate => this.logger.verbose(
        `${exchange.ISO_Code} : Closed | NextOpen at ${nextOpenDate}`
      ),
      exchange
    );
  }
  
  private addMarketOpenListener(
    listener: (...args: TOpenEventArgs) => void,
    exchange: Exchange
  ) {
    exchange.on(MARKET_OPEN, listener);
  }

  private addMarketCloseListener(
    listener: (...args: TCloseEventArgs) => void,
    exchange: Exchange
  ) {
    exchange.on(MARKET_CLOSE, listener);
  }

}