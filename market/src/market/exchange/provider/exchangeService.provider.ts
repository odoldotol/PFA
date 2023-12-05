import { FactoryProvider } from "@nestjs/common";
import { TExchangeConfig } from "src/config/const";
import { Market_Exchange } from "../class/exchange";
import { Market_ExchangeService } from "../exchange.service";
import { EXCHANGE_PROVIDER_TOKEN_SUFFIX } from "../const";
import { buildInjectionToken } from "src/common/util";

export const generateExchangeServiceFactoryProvider = (
  exchangeConfigArr: TExchangeConfig[]
): FactoryProvider<Market_ExchangeService> => {
  const exchangeProviderTokenArr = exchangeConfigArr
  .map(exchangeConfig => buildInjectionToken(
    exchangeConfig.ISO_Code,
    EXCHANGE_PROVIDER_TOKEN_SUFFIX
  ));
  return {
    provide: Market_ExchangeService,
    useFactory: (
      ...exchangeProviderArr: Market_Exchange[]
    ) => new Market_ExchangeService(exchangeProviderArr),
    inject: exchangeProviderTokenArr
  };
};