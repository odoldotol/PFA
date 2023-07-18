import { Test, TestingModule } from "@nestjs/testing";
import { ExchangeContainer } from "./exchangeContainer";

describe("ExchangeContainer", () => {

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
    it.todo("Exchange 추가");
    it.todo("ISO_Code 유니크");
  });

});