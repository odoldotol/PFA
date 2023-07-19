import { Test, TestingModule } from "@nestjs/testing";
import { ExchangeService } from "./exchange.service";
import { ExchangeContainer } from "./exchangeContainer";
import { EXCHANGE_CONFIG_ARR_TOKEN } from "./provider/exchangeConfigArr.provider";
import { mockExchageConfigArr, mockExchangeCoreArr } from "./mock/exchange.mock";
import { ChildApiService } from "./child-api/child-api.service";
import { mockChildApiService } from "./mock/childApiService.mock";

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
    it("TExchangeCore 로 exchagne 구독 시작", async () => {
      service.onModuleInit();
      const exchange = container.getOne(mockExchangeCoreArr[0].ISO_Code)!;
      const subscribeSpy = jest.spyOn(exchange, "subscribe")
        .mockReturnValue(Promise.resolve());
      await service.subscribe(mockExchangeCoreArr[0]);
      expect(subscribeSpy).toBeCalledTimes(1);
    });
  });

  describe("shouldUpdate: 업데이트 해야하는지 여부", () => {
    it.todo("");
  });

});