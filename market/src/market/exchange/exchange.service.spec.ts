import { Test, TestingModule } from "@nestjs/testing";
import { Market_ExchangeService } from "./exchange.service";
import { mockExchageConfigArr } from "./mock/exchange.mock";
import { EXCHANGE_PROVIDER_TOKEN_SUFFIX } from "./const";
import { generateExchangeServiceFactoryProvider } from "./provider";
import { buildInjectionToken } from "src/common/util";
import { ValueProvider } from "@nestjs/common";

const mockExchangeProviderArr: ValueProvider[]
= mockExchageConfigArr.map(exchangeConfig => ({
  provide: buildInjectionToken(
    exchangeConfig.ISO_Code,
    EXCHANGE_PROVIDER_TOKEN_SUFFIX
  ),
  useValue: {}
}));

const mockExchangeServiceProvider = generateExchangeServiceFactoryProvider(mockExchageConfigArr);

describe("ExchangeService", () => {
  let service: Market_ExchangeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ...mockExchangeProviderArr,
        mockExchangeServiceProvider
      ],
    }).compile();

    service = module.get<Market_ExchangeService>(Market_ExchangeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

});