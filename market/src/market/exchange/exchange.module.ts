import { DynamicModule, Module } from "@nestjs/common";
import { ChildApiModule } from "../child_api/child_api.module";
import { Market_ExchangeService } from "./exchange.service";
import { TExchangeConfig } from "src/config/const";
import {
  generateExchangeConfigValueProviderArr,
  generateExchangeFactoryProviderArr,
  generateExchangeServiceFactoryProvider
} from "./provider";

@Module({})
export class Market_ExchangeModule {
  static register(exchangeConfigArr: TExchangeConfig[]): DynamicModule {

    const exchangeConfigProviderArr = generateExchangeConfigValueProviderArr(exchangeConfigArr);
    const exchangeProviderArr = generateExchangeFactoryProviderArr(exchangeConfigArr);
    const exchangeServiceProvider = generateExchangeServiceFactoryProvider(exchangeConfigArr);

    return {
      module: Market_ExchangeModule,
      imports: [ChildApiModule],
      providers: [
        ...exchangeConfigProviderArr,
        ...exchangeProviderArr,
        exchangeServiceProvider
      ],
      exports: [Market_ExchangeService],
    }
  }
}
