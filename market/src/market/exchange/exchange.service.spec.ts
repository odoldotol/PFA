import { Test, TestingModule } from "@nestjs/testing";
import { ValueProvider } from "@nestjs/common";
import { Market_ExchangeModule } from "./exchange.module";
import { Market_ExchangeService } from "./exchange.service";
import { EXCHANGE_PROVIDER_TOKEN } from "./const";
import { MOCK_CONFIG_EXCHANGES } from "./mock/exchange.mock";
import { buildInjectionToken } from "src/common/util";
import * as F from "@fxts/core";

const mockExchangeProviderTokenArr = F.pipe(
  MOCK_CONFIG_EXCHANGES,
  F.keys,
  F.map(isoCode => buildInjectionToken(
    isoCode,
    EXCHANGE_PROVIDER_TOKEN
  )),
  F.toArray
);

const mockExchangeProviderArr
: ValueProvider[]
= F.pipe(
  mockExchangeProviderTokenArr,
  F.map(providerToken => ({
    provide: providerToken,
    useValue: {}
  })),
  F.toArray
);

const mockExchangeServiceProvider
= Market_ExchangeModule.generateExchangeServiceProvider(mockExchangeProviderTokenArr);

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