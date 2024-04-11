import { 
  ConfigExchange,
  ExchangeIsoCode,
  ExchangeIso,
  IsoTimezoneName
} from "src/common/interface";
import { YAHOO_FINANCE_UPDATE_MARGIN_DEFAULT } from "src/config";

export class Market_ExchangeConfig
  implements ExchangeIso
{
  public readonly market: string;
  public readonly isoTimezoneName: IsoTimezoneName;
  public readonly yahooFinanceUpdateMargin: number;

  constructor(
    public readonly isoCode: ExchangeIsoCode,
    config: ConfigExchange,
  ) {
    this.market = config.market;
    this.isoTimezoneName = config.ISO_TimezoneName;
    this.yahooFinanceUpdateMargin = config.yahooFinance_update_margin ||
      YAHOO_FINANCE_UPDATE_MARGIN_DEFAULT;
  }

}
