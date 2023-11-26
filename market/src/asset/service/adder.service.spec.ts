import { Test, TestingModule } from "@nestjs/testing";
import { AdderService } from "./adder.service";
import { Market_FinancialAssetService } from 'src/market/financialAsset/financialAsset.service';
import { Database_ExchangeService } from "src/database/exchange/exchange.service";
import { YfinanceInfoService } from "src/database/yf_info/yf_info.service";
import { Database_FinancialAssetService } from "src/database/financialAsset/financialAsset.service";
import { UpdaterService } from "src/asset/service/updater.service";

describe('AdderService', () => {
  let service: AdderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: Market_FinancialAssetService, useValue: {} },
        { provide: Database_ExchangeService, useValue: {} },
        { provide: YfinanceInfoService, useValue: {} },
        { provide: Database_FinancialAssetService, useValue: {} },
        { provide: UpdaterService, useValue: {} },
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