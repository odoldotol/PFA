import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { TExchangeCore } from "src/common/type/exchange.type";
import { ChildApiService } from "../child_api/child_api.service";
import { Exchange } from "./class/exchange";
import { EMarketEvent } from "./enum/eventName.enum";
import { ExchangeContainer } from "./container";
import { 
  EXCHANGE_CONFIG_ARR_TOKEN,
  TExchangeConfigArrProvider
} from "./provider/exchangeConfigArr.provider";
import * as F from "@fxts/core";

// Todo: 1 차 리팩터링 후, 여전히 이 레이어의 역할이 스스로 분명하지 않음. 업데이트 동작과 관련해서 명확한 분리|통합이 필요함.
@Injectable()
export class ExchangeService implements OnModuleInit {

  private readonly logger = new Logger(ExchangeService.name);

  constructor(
    private readonly container: ExchangeContainer,
    @Inject(EXCHANGE_CONFIG_ARR_TOKEN) private readonly exchangeConfigArr: TExchangeConfigArrProvider,
    private readonly childApiSrv: ChildApiService
  ) {}

  async onModuleInit() {
    await F.pipe(
      this.exchangeConfigArr, F.toAsync,
      F.map(a => new Exchange(a, this.childApiSrv)), // is it anti-pattern?
      F.peek(this.subscribe.bind(this)),
      F.each(a => this.container.add(a))
    );
  }

  private async subscribe(exchange: Exchange) {
    try {
      exchange.on('error', e => {
        throw e; //
      });
      await exchange.subscribe();
    } catch (e) {
      this.logger.warn(e);
    }
  }

  public registerUpdater(
    updateAssetsOfExchange: (exchange: Exchange, launcher: LogPriceUpdate["launcher"]) => Promise<void>,
    exchangeCore: TExchangeCore
  ) {
    const exchange = this.getExchagne(exchangeCore);
    exchange.on(EMarketEvent.UPDATE, () => updateAssetsOfExchange(exchange, "scheduler"));
    this.logger.verbose(`${exchange.ISO_Code} : Updater Registered`);
  }

  public shouldUpdate(exchangeCore: TExchangeCore) {
    const exchange = this.getExchagne(exchangeCore);
    const result = new Date(exchangeCore.marketDate) < exchange.getMarketDate();
    result && exchange.isMarketOpen() && this.logger.warn(`${exchange.ISO_Code} : shouldUpdate return "true" while Open`);
    return result;
  }

  public fulfillUpdater(
    updateAssetsOfExchange: (exchange: Exchange, launcher: LogPriceUpdate["launcher"]) => Promise<void>,
    exchangeCore: TExchangeCore
  ) {
    const exchange = this.getExchagne(exchangeCore);
    return updateAssetsOfExchange.bind(null, exchange);
  }

  private getExchagne(exchangeCore: TExchangeCore) {
    const exchange = this.container.getOne(exchangeCore.ISO_Code);
    if (!exchange) {
      throw new Error("Not exists exchange");
    }
    return exchange;
  }

  // ----------- Legacy 지원 메서드 ------------------------------
  // Todo: 리팩터링 완료후 사라져야할 메서드
  public findExchange(ISO_TimezoneName: string) {
    return [...this.container.getAll().values()].find((exchange) => {
      if (exchange.ISO_TimezoneName === ISO_TimezoneName) {
        return true;
      }
    });
  }

  // DEV
  public findAll() {
    return [...this.container.getAll().values()];
  }

}