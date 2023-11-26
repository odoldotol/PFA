import { Test, TestingModule } from "@nestjs/testing";
import { AdderService } from "./adder.service";
import { Market_FinancialAssetService } from 'src/market/financialAsset/financialAsset.service';
import { Database_ExchangeService } from "src/database/exchange/exchange.service";
import { YfinanceInfoService } from "src/database/yf_info/yf_info.service";
import { Database_FinancialAssetService } from "src/database/financialAsset/financialAsset.service";
import { UpdaterService } from "src/asset/service/updater.service";
import { mockApple } from "src/database/mock";

class MockMarket_FinancialAssetService {}
class MockDatabase_ExchangeService {}
class MockYfinanceInfoService {}
class MockDatabase_FinancialAssetService {
  public readOneByPk(ticker: string) {
    if (ticker === mockApple.symbol) return Promise.resolve(mockApple);
    else return Promise.resolve(null);
  }
}
class MockUpdaterService {}

describe('AdderService', () => {
  let service: AdderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: Market_FinancialAssetService, useClass: MockMarket_FinancialAssetService },
        { provide: Database_ExchangeService, useClass: MockDatabase_ExchangeService },
        { provide: YfinanceInfoService, useClass: MockYfinanceInfoService },
        { provide: Database_FinancialAssetService, useClass: MockDatabase_FinancialAssetService },
        { provide: UpdaterService, useClass: MockUpdaterService },
        AdderService
      ],
    }).compile();

    service = module.get<AdderService>(AdderService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addAssets', () => {
    it.todo('전부 이미 존재하는경우');
    it.todo('생성');
    it.todo('생성 + 새로운 Exchange 생성');
  });

});