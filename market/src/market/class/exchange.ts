import { TExchangeConfig } from "src/config/const/exchanges.const";
import { EventEmitter } from "stream";

export class Exchange extends EventEmitter {

  private readonly market: string;
  private readonly ISO_Code: string; // id
  private readonly ISO_TimezoneName: string;

  constructor(
    exchangeConfig: TExchangeConfig,
  ) {
    super();
    this.market = exchangeConfig.market;
    this.ISO_Code = exchangeConfig.ISO_Code;
    this.ISO_TimezoneName = exchangeConfig.ISO_TimezoneName;
  }

  get id() {
    return this.ISO_Code;
  }

}
