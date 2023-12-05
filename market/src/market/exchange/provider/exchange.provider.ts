import { FactoryProvider } from "@nestjs/common";
import { Market_ExchangeConfig } from "../class/exchangeConfig";
import { Market_ExchangeSession } from "../class/exchangeSession";
import { Market_Exchange } from "../class/exchange";
import { TExchangeConfig } from "src/config/const";
import {
  EXCHANGE_CONFIG_PROVIDER_TOKEN_SUFFIX,
  EXCHANGE_SESSION_PROVIDER_TOKEN_SUFFIX,
  EXCHANGE_PROVIDER_TOKEN_SUFFIX
} from "../const";
import { buildInjectionToken } from "src/common/util";

export const generateExchangeFactoryProviderArr = (
  exchangeConfigArr: TExchangeConfig[]
): FactoryProvider<Market_Exchange>[] =>
exchangeConfigArr.map(exchangeConfig => ({
  provide: buildInjectionToken(
    exchangeConfig.ISO_Code,
    EXCHANGE_PROVIDER_TOKEN_SUFFIX
  ),
  useFactory: (
    exchangeConfig: Market_ExchangeConfig,
    exchangeSession: Market_ExchangeSession
  ) => new Market_Exchange(exchangeConfig, exchangeSession),
  inject: [
    buildInjectionToken(
      exchangeConfig.ISO_Code,
      EXCHANGE_CONFIG_PROVIDER_TOKEN_SUFFIX
    ),
    buildInjectionToken(
      exchangeConfig.ISO_Code,
      EXCHANGE_SESSION_PROVIDER_TOKEN_SUFFIX
    )
  ]
}));