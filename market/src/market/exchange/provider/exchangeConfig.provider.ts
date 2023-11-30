import { ValueProvider } from "@nestjs/common";
import { TExchangeConfig } from "src/config/const";
import { EXCHANGE_CONFIG_TOKEN_SUFFIX } from "../const";

export const generateExchangeConfigValueProviderArr = (
  exchangeConfigArr: TExchangeConfig[]
): ValueProvider<TExchangeConfig>[] => exchangeConfigArr.map(exchangeConfig => ({
  provide: exchangeConfig.ISO_Code + EXCHANGE_CONFIG_TOKEN_SUFFIX,
  useValue: exchangeConfig
}));