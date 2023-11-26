import { Test, TestingModule } from "@nestjs/testing";
import { Market_ExchangeService } from 'src/market/exchange/exchange.service';
import { Market_FinancialAssetService } from 'src/market/financialAsset/financialAsset.service';
import { Database_ExchangeService } from "src/database/exchange/exchange.service";
import { Database_FinancialAssetService } from "src/database/financialAsset/financialAsset.service";
import { UpdaterService } from "src/asset/service/updater.service";
import { mockApple } from "src/database/mock";
import { UpdaterService as DbUpdaterService } from 'src/database/updater.service';
import { ProductApiService } from 'src/product_api/product_api.service';

class MockMarket_ExchangeService {}
class MockMarket_FinancialAssetService {}
class MockDatabase_ExchangeService {}
class MockDatabase_FinancialAssetService {
  public readOneByPk(ticker: string) {
    if (ticker === mockApple.symbol) return Promise.resolve(mockApple);
    else return Promise.resolve(null);
  }
}
class MockDbUpdaterService {}
class MockProductApiService {}

describe('UpdaterService', () => {
  let service: UpdaterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: Market_ExchangeService, useClass: MockMarket_ExchangeService },
        { provide: Market_FinancialAssetService, useClass: MockMarket_FinancialAssetService },
        { provide: Database_ExchangeService, useClass: MockDatabase_ExchangeService },
        { provide: Database_FinancialAssetService, useClass: MockDatabase_FinancialAssetService },
        { provide: DbUpdaterService, useClass: MockDbUpdaterService },
        { provide: ProductApiService, useClass: MockProductApiService },
        UpdaterService
      ],
    }).compile();

    service = module.get<UpdaterService>(UpdaterService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

});