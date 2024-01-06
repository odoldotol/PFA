import { Test, TestingModule } from "@nestjs/testing";
import { Market_FinancialAssetService } from "./financialAsset.service";
import { YfinanceApiService } from "../childApi/yfinanceApi.service";

describe('MarketService', () => {
    let service: Market_FinancialAssetService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                { provide: YfinanceApiService, useValue: {} },
                Market_FinancialAssetService
            ],
        }).compile();

        service = module.get(Market_FinancialAssetService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('fetchInfo', () => {
        it.todo('fetchInfo')
    });

    describe('fetchPrice', () => {
        it.todo('fetchPrice');
    });
});