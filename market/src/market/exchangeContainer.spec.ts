import { Test, TestingModule } from "@nestjs/testing";
import { ExchangeContainer } from "./exchangeContainer";
import { Exchange } from "./class/exchange";
import { mockExchageConfigArr } from "./mock/exchange.mock";
import { mockChildApiService } from "./mock/childApiService.mock";

describe("ExchangeContainer", () => {

  const mockExchange1 = new Exchange(mockExchageConfigArr[0], mockChildApiService);
  const mockExchange2 = new Exchange(mockExchageConfigArr[1], mockChildApiService);

  let container: ExchangeContainer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExchangeContainer
      ],
    }).compile();

    container = module.get<ExchangeContainer>(ExchangeContainer);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(container).toBeDefined();
  });

  describe("add", () => {
    it("Exchange 추가", () => {
      expect(container.getOne(mockExchange1.ISO_Code)).toBeUndefined();
      container.add(mockExchange1);
      expect(container.getOne(mockExchange1.ISO_Code)).toBe(mockExchange1);
    });
    it("컨테이너 안의 Exchange 는 ISO_Code 에 대해 유니크해야함", () => {
      container.add(mockExchange1);
      expect(() => {
        container.add(mockExchange1);
      }).toThrowError("Already exists exchange");
    });
  });

  describe("getOne", () => {
    it("ISO_Code로 Exchange 가져오기", () => {
      container.add(mockExchange1);
      container.add(mockExchange2);
      expect(container.getOne(mockExchange1.ISO_Code)).toBe(mockExchange1);
      expect(container.getOne(mockExchange2.ISO_Code)).toBe(mockExchange2);
    });
  });

});