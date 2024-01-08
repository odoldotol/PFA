import { Test, TestingModule } from "@nestjs/testing";
import { Market_FinancialAssetService } from "src/market/financialAsset/financialAsset.service";
import { Database_FinancialAssetService } from "src/database/financialAsset/financialAsset.service";
import { Asset_UpdaterService } from "src/asset/service/updater.service";

describe('UpdaterService', () => {
  let service: Asset_UpdaterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: Market_FinancialAssetService, useValue: {} },
        { provide: Database_FinancialAssetService, useValue: {} },
        Asset_UpdaterService
      ],
    }).compile();

    service = module.get(Asset_UpdaterService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

});