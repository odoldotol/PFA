import { Test, TestingModule } from "@nestjs/testing";
import { ChildApiService } from "../child_api/child_api.service";
import { Market_ExchangeService as ExchangeService } from "../exchange/exchange.service";
import { Market_FinancialAssetService as FinancialAssetService } from "./financialAsset.service";

class MockChildApiService {}
class MockExchangeService {}

describe('MarketService', () => {
    let service: FinancialAssetService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
              { provide: ChildApiService, useClass: MockChildApiService },
              { provide: ExchangeService, useClass: MockExchangeService },
              FinancialAssetService
            ],
        }).compile();

        service = module.get(FinancialAssetService);
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