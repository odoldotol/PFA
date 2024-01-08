import { Test, TestingModule } from "@nestjs/testing";
import { Market_FinancialAssetService } from "./financialAsset.service";
import { YfinanceApiService } from "../childApi/yfinanceApi.service";
import { Market_ExchangeService } from "../exchange/exchange.service";

describe('Market_FinancialAssetService', () => {
    let service: Market_FinancialAssetService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                { provide: YfinanceApiService, useValue: {} },
                { provide: Market_ExchangeService, useValue: {} },
                Market_FinancialAssetService
            ],
        }).compile();

        service = module.get(Market_FinancialAssetService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});