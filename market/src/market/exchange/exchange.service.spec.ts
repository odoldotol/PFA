import { Test, TestingModule } from "@nestjs/testing";
import { Market_ExchangeService as ExchangeService } from "./exchange.service";
import { mockExchageConfigArr } from "./mock/exchange.mock";
import { ChildApiService } from "../child_api/child_api.service";
import { 
  EXCHANGE_CONFIG_TOKEN_SUFFIX,
  EXCHANGE_PROVIDER_TOKEN_SUFFIX
} from "./const";
import { generateExchangeServiceFactoryProvider } from "./provider";

const mockExchangeConfigProviderArr = mockExchageConfigArr.map(exchangeConfig => ({
  provide: exchangeConfig.ISO_Code + EXCHANGE_CONFIG_TOKEN_SUFFIX,
  useValue: {}
}));

const mockExchangeProviderArr = mockExchageConfigArr.map(exchangeConfig => ({
  provide: exchangeConfig.ISO_Code + EXCHANGE_PROVIDER_TOKEN_SUFFIX,
  useValue: {}
}));

const mockExchangeServiceProvider = generateExchangeServiceFactoryProvider(mockExchageConfigArr);

describe("ExchangeService", () => {
  
  let service: ExchangeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: ChildApiService, useValue: {} },
        ...mockExchangeConfigProviderArr,
        ...mockExchangeProviderArr,
        mockExchangeServiceProvider
      ],
    }).compile();

    service = module.get<ExchangeService>(ExchangeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

});