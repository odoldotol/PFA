import { Test, TestingModule } from "@nestjs/testing";
import { ExchangeService } from "./exchange.service";
import { ExchangeContainer } from "./exchangeContainer";
import { 
  EXCHANGE_CONFIG_ARR_TOKEN,
  TExchangeConfigArrProvider
} from "./provider/exchangeConfigArr.provider";


describe("ExchangeService", () => {

  const mockExchageConfigArr: TExchangeConfigArrProvider = [
    {
      ISO_Code: "ISO_Code1",
      ISO_TimezoneName: "ISO_TimezoneName1",
      market: "market1"
    },
    {
      ISO_Code: "ISO_Code2",
      ISO_TimezoneName: "ISO_TimezoneName2",
      market: "market2"
    }
  ]
  
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

  describe("", () => {

  });

});