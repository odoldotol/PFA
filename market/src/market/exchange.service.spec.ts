import { Test, TestingModule } from "@nestjs/testing";
import { ExchangeService } from "./exchange.service";
import { ExchangeContainer } from "./exchangeContainer";
import { EXCHANGE_CONFIG_ARR_TOKEN } from "./provider/exchangeConfigArr.provider";
import { mockExchageConfigArr } from "./mock/exchangeConfigArr";
import { ChildApiService } from "./child-api/child-api.service";

const mockChildApiService = {}

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
      expect(addSpy).toBeCalledTimes(2);
    });
  });

  describe("subscribe: Exchange 구독하기", () => {
    it.todo("세션 정보 등록");
    it.todo("마켓의 오픈 클로즈를 이벤트로 방출하도록 함");
  });

});