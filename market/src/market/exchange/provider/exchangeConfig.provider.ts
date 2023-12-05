import { FactoryProvider } from "@nestjs/common";
import { TExchangeConfig } from "src/config/const";
import { EXCHANGE_CONFIG_PROVIDER_TOKEN_SUFFIX } from "../const";
import { Market_ExchangeConfig } from "../class/exchangeConfig";
import { buildInjectionToken } from "src/common/util";

export const generateExchangeConfigFactoryProviderArr = (
  exchangeConfigArr: TExchangeConfig[]
): FactoryProvider<Market_ExchangeConfig>[] =>
exchangeConfigArr.map(exchangeConfig => ({
  provide: buildInjectionToken(
    exchangeConfig.ISO_Code,
    EXCHANGE_CONFIG_PROVIDER_TOKEN_SUFFIX
  ),
  useFactory: () => new Market_ExchangeConfig(exchangeConfig)
}));