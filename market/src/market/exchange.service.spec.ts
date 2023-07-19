import { Test, TestingModule } from "@nestjs/testing";
import { ExchangeService } from "./exchange.service";
import { ExchangeContainer } from "./exchangeContainer";
import { EXCHANGE_CONFIG_ARR_TOKEN } from "./provider/exchangeConfigArr.provider";
import { mockExchageConfigArr } from "./mock/exchangeConfigArr";
import { ChildApiService } from "./child-api/child-api.service";
import { mockChildApiService } from "./mock/childApiService";
import { Exchange } from "./class/exchange";

describe("ExchangeService", () => {
  
  let service: ExchangeService;
  let container: ExchangeContainer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExchangeService,
        ExchangeContainer,
        {
          provide: EXCHANGE_CONFIG_ARR_TOKEN,
          useValue: mockExchageConfigArr
        },
        {
          provide: ChildApiService,
          useValue: mockChildApiService
        }
      ],
    }).compile();

    service = module.get<ExchangeService>(ExchangeService);
    container = module.get<ExchangeContainer>(ExchangeContainer);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("onModuleInit", () => {
    it("exchange 생성하고 컨테이너에 넣기", () => {
      const addSpy = jest.spyOn(container, "add");
      service.onModuleInit();
      expect(addSpy).toBeCalledTimes(mockExchageConfigArr.length);
    });
  });

  describe("subscribe: Exchange 구독하기", () => {
    it("exchangeId 로 exchagne 구독 시작하고 exchange 반환", async () => {
      service.onModuleInit();
      const exchangeId = mockExchageConfigArr[0].ISO_Code;
      const exchange = container.getOne(exchangeId)!;
      const subscribeSpy = jest.spyOn(exchange, "subscribe").mockReturnValue(Promise.resolve());
      const result = await service.subscribe(exchangeId);
      expect(subscribeSpy).toBeCalledTimes(1);
      expect(result).toBeInstanceOf(Exchange);
      expect(result === exchange).toBeTruthy();
    });
  });

});