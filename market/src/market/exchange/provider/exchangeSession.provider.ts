import { FactoryProvider } from "@nestjs/common";
import { TExchangeConfig } from "src/config/const";
import { EXCHANGE_SESSION_PROVIDER_TOKEN_SUFFIX } from "../const";
import { Market_ExchangeSession } from "../class/exchangeSession";
import { ChildApiService } from "src/market/child_api/child_api.service";
import { buildInjectionToken } from "src/common/util";

export const generateExchangeSessionFactoryProviderArr = (
  exchangeConfigArr: TExchangeConfig[]
): FactoryProvider<Market_ExchangeSession>[] =>
exchangeConfigArr.map(exchangeConfig => ({
  provide: buildInjectionToken(
    exchangeConfig.ISO_Code,
    EXCHANGE_SESSION_PROVIDER_TOKEN_SUFFIX
  ),
  useFactory: (
    childApiSrv: ChildApiService
  ) => new Market_ExchangeSession(exchangeConfig, childApiSrv),
  inject: [ ChildApiService ]
}));