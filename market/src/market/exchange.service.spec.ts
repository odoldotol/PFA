import { Test, TestingModule } from "@nestjs/testing";
import { ExchangeService } from "./exchange.service";
import { ExchangeContainer } from "./exchangeContainer";
import { EXCHANGE_CONFIG_ARR_TOKEN } from "./provider/exchangeConfigArr.provider";
import { mockExchageConfigArr, mockExchangeCoreArr } from "./mock/exchange.mock";
import { ChildApiService } from "./child_api/child_api.service";
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
    it("exchange 생성하고 컨테이너에 넣기", async () => {
      const addSpy = jest.spyOn(container, "add");
      await service.onModuleInit();
      expect(addSpy).toBeCalledTimes(mockExchageConfigArr.length);
    });

    it.todo("구독")
  });

  describe("shouldUpdate: 업데이트 해야하는지 여부", () => {
    it.todo("");
  });

});