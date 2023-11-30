import { FactoryProvider } from "@nestjs/common";
import { Exchange } from "../class/exchange";
import { TExchangeConfig } from "src/config/const";
import {
  EXCHANGE_CONFIG_TOKEN_SUFFIX,
  EXCHANGE_PROVIDER_TOKEN_SUFFIX
} from "../const";
import { ChildApiService } from "src/market/child_api/child_api.service";

export const generateExchangeFactoryProviderArr = (
  exchangeConfigArr: TExchangeConfig[]
): FactoryProvider<Exchange>[] => exchangeConfigArr.map((exchangeConfig) => ({
  provide: exchangeConfig.ISO_Code + EXCHANGE_PROVIDER_TOKEN_SUFFIX,
  useFactory: (
    exchangeConfig: TExchangeConfig,
    childApiSrv: ChildApiService
  ) => new Exchange(exchangeConfig, childApiSrv),
  inject: [
    exchangeConfig.ISO_Code + EXCHANGE_CONFIG_TOKEN_SUFFIX,
    ChildApiService
  ]
}));