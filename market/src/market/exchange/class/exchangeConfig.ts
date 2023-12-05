import {
  TExchangeConfig,
  YF_update_margin_DEFAULT
} from "src/config/const";

export class Market_ExchangeConfig {

  public readonly market: string;
  public readonly ISO_Code: string;
  public readonly ISO_TimezoneName: string;
  public readonly YF_update_margin: number;

  constructor(
    config: TExchangeConfig,
  ) {
    this.market = config.market;
    this.ISO_Code = config.ISO_Code;
    this.ISO_TimezoneName = config.ISO_TimezoneName;
    this.YF_update_margin = config.YF_update_margin || YF_update_margin_DEFAULT;
  }

}
