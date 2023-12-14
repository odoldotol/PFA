import {
  DynamicModule,
  FactoryProvider,
  Module,
  ValueProvider
} from "@nestjs/common";
import { ChildApiModule } from "../child_api/child_api.module";
import { ChildApiService } from "../child_api/child_api.service";
import {
  Market_ExchangeConfig,
  Market_ExchangeSession,
  Market_Exchange
} from "./class";
import { Market_ExchangeService } from "./exchange.service";
import { ConfigExchange, ConfigExchanges, ExchangeIsoCode } from "src/common/interface";
import {
  EXCHANGE_CONFIG_PROVIDER_TOKEN_SUFFIX,
  EXCHANGE_PROVIDER_TOKEN_SUFFIX,
  EXCHANGE_SESSION_PROVIDER_TOKEN_SUFFIX
} from "./const";
import { buildInjectionToken } from "src/common/util";
import * as F from "@fxts/core";

@Module({})
export class Market_ExchangeModule {
  public static register(
    CONFIG_EXCHANGES: ConfigExchanges
  ): DynamicModule {
    const configMap = this.createConfigMap(CONFIG_EXCHANGES);
    const exchangeProviderTokenArr
    = configMap(this.generateExchangeProviderToken);
    return {
      module: Market_ExchangeModule,
      imports: [ChildApiModule],
      providers: [
        ...configMap(this.generateExchangeConfigProvider),
        ...configMap(this.generateExchangeSessionProvider),
        ...configMap(this.generateExchangeProvider),
        this.generateExchangeServiceProvider(exchangeProviderTokenArr)
      ],
      exports: [Market_ExchangeService],
    }
  }

  private static generateExchangeConfigProvider(
    isoCode: ExchangeIsoCode,
    configExchange: ConfigExchange
  ): ValueProvider<Market_ExchangeConfig> {
    return {
      provide: buildInjectionToken(
        isoCode,
        EXCHANGE_CONFIG_PROVIDER_TOKEN_SUFFIX
      ),
      useValue: new Market_ExchangeConfig(
        isoCode,
        configExchange
      )
    }
  }

  private static generateExchangeSessionProvider = (
    isoCode: ExchangeIsoCode,
    _: ConfigExchange
  ): FactoryProvider<Market_ExchangeSession> => {
    return {
      provide: buildInjectionToken(
        isoCode,
        EXCHANGE_SESSION_PROVIDER_TOKEN_SUFFIX
      ),
      useFactory: (
        childApiSrv: ChildApiService
      ) => new Market_ExchangeSession(
        isoCode,
        childApiSrv
      ),
      inject: [ ChildApiService ]
    }
  }

  private static generateExchangeProvider = (
    isoCode: ExchangeIsoCode,
    _: ConfigExchange
  ): FactoryProvider<Market_Exchange> => {
    return {
      provide: buildInjectionToken(
        isoCode,
        EXCHANGE_PROVIDER_TOKEN_SUFFIX
      ),
      useFactory: (
        exchangeConfig: Market_ExchangeConfig,
        exchangeSession: Market_ExchangeSession
      ) => new Market_Exchange(
        exchangeConfig,
        exchangeSession
      ),
      inject: [
        buildInjectionToken(
          isoCode,
          EXCHANGE_CONFIG_PROVIDER_TOKEN_SUFFIX
        ),
        buildInjectionToken(
          isoCode,
          EXCHANGE_SESSION_PROVIDER_TOKEN_SUFFIX
        )
      ]
    }
  }

  public static generateExchangeServiceProvider = (
    exchangeProviderTokenArr: string[]
  ): FactoryProvider<Market_ExchangeService> => {
    return {
      provide: Market_ExchangeService,
      useFactory: (
        ...exchangeProviderArr: Market_Exchange[]
      ) => new Market_ExchangeService(exchangeProviderArr),
      inject: exchangeProviderTokenArr
    };
  }

  private static generateExchangeProviderToken(
    isoCode: ExchangeIsoCode,
    _: ConfigExchange
  ): string {
    return buildInjectionToken(
      isoCode,
      EXCHANGE_PROVIDER_TOKEN_SUFFIX
    );
  }

  private static createConfigMap(
    CONFIG_EXCHANGES: ConfigExchanges
  ) {
    return <T>(
      fn: (
        isoCode: ExchangeIsoCode,
        configExchange: ConfigExchange
      ) => T
    ): T[] => F.pipe(
      CONFIG_EXCHANGES,
      F.entries,
      F.map(([isoCode, configExchange]) => fn(isoCode, configExchange)),
      F.toArray
    );
  }

}
