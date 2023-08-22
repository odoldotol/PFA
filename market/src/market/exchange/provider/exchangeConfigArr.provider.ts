import { 
  exchangeConfigArr,
  TExchangeConfig
} from "src/config/const/exchanges.const";

export const EXCHANGE_CONFIG_ARR_TOKEN = "EXCHANGE_CONFIG_ARR";

export const ExchangeConfigArrProvider = {
  provide: EXCHANGE_CONFIG_ARR_TOKEN,
  useValue: exchangeConfigArr
};

export type TExchangeConfigArrProvider = TExchangeConfig[];