import { Test, TestingModule } from "@nestjs/testing";
import { Market_ExchangeService } from 'src/market/exchange/exchange.service';
import { MarketService } from "src/market/market.service";
import { Database_ExchangeService } from "src/database/exchange/exchange.service";
import { Database_FinancialAssetService } from "src/database/financialAsset/financialAsset.service";
import { UpdaterService } from "src/asset/service/updater.service";
import { UpdaterService as DbUpdaterService } from 'src/database/updater.service';
import { ProductApiService } from 'src/product_api/product_api.service';

describe('UpdaterService', () => {
  let service: UpdaterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: Market_ExchangeService, useValue: {} },
        { provide: MarketService, useValue: {} },
        { provide: Database_ExchangeService, useValue: {} },
        { provide: Database_FinancialAssetService, useValue: {} },
        { provide: DbUpdaterService, useValue: {} },
        { provide: ProductApiService, useValue: {} },
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