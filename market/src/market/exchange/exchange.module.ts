import { DynamicModule, Module } from "@nestjs/common";
import { ChildApiModule } from "../child_api/child_api.module";
import { Market_ExchangeService } from "./exchange.service";
import { TExchangeConfig } from "src/config/const";
import {
  generateExchangeConfigFactoryProviderArr,
  generateExchangeSessionFactoryProviderArr,
  generateExchangeFactoryProviderArr,
  generateExchangeServiceFactoryProvider
} from "./provider";

@Module({})
export class Market_ExchangeModule {
  static register(exchangeConfigArr: TExchangeConfig[]): DynamicModule {

    const exchangeConfigProviderArr
    = generateExchangeConfigFactoryProviderArr(exchangeConfigArr);
    
    const exchangeSessionFactoryProviderArr
    = generateExchangeSessionFactoryProviderArr(exchangeConfigArr);
    
    const exchangeProviderArr
    = generateExchangeFactoryProviderArr(exchangeConfigArr);
    
    const exchangeServiceProvider
    = generateExchangeServiceFactoryProvider(exchangeConfigArr);

    return {
      module: Market_ExchangeModule,
      imports: [ChildApiModule],
      providers: [
        ...exchangeConfigProviderArr,
        ...exchangeSessionFactoryProviderArr,
        ...exchangeProviderArr,
        exchangeServiceProvider
      ],
      exports: [Market_ExchangeService],
    }
  }
}
